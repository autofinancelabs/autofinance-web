import {Cost} from '../domain/model/cost.value-object';
import {CostBasis} from '../domain/model/cost-basis';
import {CostTiming} from '../domain/model/cost-timing';
import {GraceType} from '../domain/model/grace-type';
import {RateType} from '../domain/model/rate-type';
import {SimulationDraft} from '../domain/model/simulation-draft.command';
import {SimulationState} from '../domain/model/simulation-state';
import {SimulationAssembler} from './simulation-assembler';
import {SimulationResource} from './simulation-response';

function makeDraft(
  overrides: Partial<{rateType: RateType; capitalization: number | null; ratePeriod: number | null}> = {},
): SimulationDraft {
  return new SimulationDraft({
    clientId: 'cl-1',
    vehicleOfferId: 'vo-1',
    rateValue: 0.15,
    rateType: RateType.NOMINAL,
    capitalization: 1,
    ratePeriod: null,
    initialPercentage: 0.2,
    balloonPercentage: 0.4,
    numberOfInstallments: 36,
    frequencyDays: 30,
    daysPerYear: 360,
    gracePlan: [GraceType.TOTAL, GraceType.PARTIAL, GraceType.NONE],
    costs: [
      new Cost({
        name: 'GPS',
        value: 20,
        basis: CostBasis.FIXED,
        timing: CostTiming.PERIODIC,
        embedded: false,
      }),
    ],
    costOfCapitalAnnual: 0.5,
    ...overrides,
  });
}

function makeResource(): SimulationResource {
  return {
    id: 's-1',
    clientId: 'cl-1',
    vehicleOfferId: 'vo-1',
    salePrice: {amount: 16000, currency: 'PEN'},
    rate: {value: 0.15, type: 'NOMINAL', capitalization: 1, ratePeriod: 30},
    initialPercentage: 0.2,
    balloonPercentage: 0.4,
    term: {numberOfInstallments: 36, frequencyDays: 30, installmentsPerYear: 12, daysPerYear: 360},
    grace: ['TOTAL', 'PARTIAL', 'NONE'],
    costs: [{name: 'GPS', value: 20, basis: 'FIXED', timing: 'PERIODIC', embedded: false}],
    costOfCapital: {value: 0.5, type: 'EFFECTIVE', capitalization: null, ratePeriod: null},
    loanAmount: {amount: 12975, currency: 'PEN'},
    financedBalance: {amount: 9015.99, currency: 'PEN'},
    indicators: {
      npv: 4436.18,
      periodicIrr: 0.0158,
      tcea: 0.2078,
      effectiveAnnualRate: 0.1618,
      periodicRate: 0.0126,
      periodicCostOfCapital: 0.0344,
    },
    schedule: [
      {
        period: 1,
        graceType: 'TOTAL',
        openingBalanceBalloon: 3959.01,
        interestBalloon: 49.79,
        balloonCreditLifeInsurance: 4.42,
        closingBalanceBalloon: 4010.74,
        openingBalance: 9015.99,
        interest: 113.38,
        installment: 0,
        amortization: 0,
        closingBalance: 9129.37,
        cashFlow: 35.42,
        appliedCosts: [{name: 'GPS', amount: 20}],
      },
    ],
    summary: {
      totalInterest: 2264.74,
      totalAmortization: 12975,
      totalLoanInstallments: 13650,
      totalToPay: 20000,
      totalsPerCost: {GPS: 740, Portes: 129.5},
    },
    state: 'GENERATED',
    createdAt: '2026-06-01T12:00:00Z',
  };
}

describe('SimulationAssembler', () => {
  const assembler = new SimulationAssembler();

  it('maps a draft to a request including capitalization for a nominal rate', () => {
    const request = assembler.toGenerateRequest(makeDraft());
    expect(request.rateType).toBe('NOMINAL');
    expect(request.capitalization).toBe(1);
    expect(request.gracePlan).toEqual(['TOTAL', 'PARTIAL', 'NONE']);
    expect(request.costs).toEqual([
      {name: 'GPS', value: 20, basis: 'FIXED', timing: 'PERIODIC', embedded: false},
    ]);
    expect(request.costOfCapitalAnnual).toBe(0.5);
  });

  it('omits capitalization for an effective rate', () => {
    const request = assembler.toGenerateRequest(
      makeDraft({rateType: RateType.EFFECTIVE, capitalization: null}),
    );
    expect(request.rateType).toBe('EFFECTIVE');
    expect('capitalization' in request).toBe(false);
  });

  it('includes ratePeriod when set and omits it when null (annual)', () => {
    expect('ratePeriod' in assembler.toGenerateRequest(makeDraft())).toBe(false);
    const withPeriod = assembler.toGenerateRequest(makeDraft({ratePeriod: 30}));
    expect(withPeriod.ratePeriod).toBe(30);
  });

  it('maps a response to the aggregate (money, rate, term, schedule, indicators)', () => {
    const sim = assembler.toEntityFromResource(makeResource());
    expect(sim.id).toBe('s-1');
    expect(sim.salePrice.amount).toBe(16000);
    expect(sim.salePrice.currency).toBe('PEN');
    expect(sim.rate.type).toBe(RateType.NOMINAL);
    expect(sim.rate.capitalization).toBe(1);
    expect(sim.rate.ratePeriod).toBe(30);
    expect(sim.rate.isNominal).toBe(true);
    expect(sim.costOfCapital.capitalization).toBeNull();
    expect(sim.costOfCapital.ratePeriod).toBeNull();
    expect(sim.term.installmentsPerYear).toBe(12);
    expect(sim.grace).toEqual([GraceType.TOTAL, GraceType.PARTIAL, GraceType.NONE]);
    expect(sim.indicators.npv).toBe(4436.18);
    expect(sim.state).toBe(SimulationState.GENERATED);
  });

  it('maps a schedule row with its applied costs', () => {
    const sim = assembler.toEntityFromResource(makeResource());
    const row = sim.schedule[0];
    expect(row.period).toBe(1);
    expect(row.graceType).toBe(GraceType.TOTAL);
    expect(row.closingBalanceBalloon).toBe(4010.74);
    expect(row.costNamed('GPS')).toBe(20);
    expect(row.costNamed('Unknown')).toBe(0);
  });

  it('maps the summary totalsPerCost map to an array', () => {
    const sim = assembler.toEntityFromResource(makeResource());
    expect(sim.summary.totalToPay).toBe(20000);
    expect(sim.summary.totalsPerCost).toHaveLength(2);
    expect(sim.summary.totalsPerCost).toContainEqual(
      expect.objectContaining({name: 'GPS'}),
    );
    expect(sim.summary.totalsPerCost.find(c => c.name === 'GPS')?.total).toBe(740);
  });

  it('maps a list of resources', () => {
    const sims = assembler.toEntitiesFromResource([makeResource()]);
    expect(sims).toHaveLength(1);
    expect(sims[0].id).toBe('s-1');
  });
});

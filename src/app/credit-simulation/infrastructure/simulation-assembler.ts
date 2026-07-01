import {Currency} from '../../shared/domain/model/currency';
import {Money} from '../../shared/domain/model/money';
import {AppliedCost} from '../domain/model/applied-cost.value-object';
import {Cost} from '../domain/model/cost.value-object';
import {CostBasis} from '../domain/model/cost-basis';
import {CostTiming} from '../domain/model/cost-timing';
import {CostTotal} from '../domain/model/cost-total.value-object';
import {CreditSimulation} from '../domain/model/credit-simulation.entity';
import {GraceType} from '../domain/model/grace-type';
import {Indicators} from '../domain/model/indicators.value-object';
import {Percentage} from '../domain/model/percentage.value-object';
import {Rate} from '../domain/model/rate.value-object';
import {RateType} from '../domain/model/rate-type';
import {ScheduleRow} from '../domain/model/schedule-row.value-object';
import {SimulationDraft} from '../domain/model/simulation-draft.command';
import {SimulationState} from '../domain/model/simulation-state';
import {SimulationSummary} from '../domain/model/simulation-summary.value-object';
import {Term} from '../domain/model/term.value-object';
import {
  CostResource,
  GenerateSimulationResource,
  RateResource,
  ScheduleRowResource,
  SimulationResource,
} from './simulation-response';

/**
 * Anti-corruption layer for credit simulations. Maps the draft command to the
 * generate request (omitting `capitalization` for effective rates), and the full
 * response back to the domain aggregate (Money, Rate, Term, schedule, indicators,
 * summary). Enum strings on the wire map directly to the const-union types.
 */
export class SimulationAssembler {
  toGenerateRequest(draft: SimulationDraft): GenerateSimulationResource {
    const resource: GenerateSimulationResource = {
      clientId: draft.clientId,
      vehicleOfferId: draft.vehicleOfferId,
      rateValue: draft.rateValue,
      rateType: draft.rateType,
      initialPercentage: draft.initialPercentage,
      balloonPercentage: draft.balloonPercentage,
      numberOfInstallments: draft.numberOfInstallments,
      frequencyDays: draft.frequencyDays,
      daysPerYear: draft.daysPerYear,
      gracePlan: draft.gracePlan.map(grace => grace as string),
      costs: draft.costs.map(cost => this.toCostResource(cost)),
      costOfCapitalAnnual: draft.costOfCapitalAnnual,
    };
    // Capitalization is only sent for nominal rates.
    if (draft.capitalization !== null) {
      resource.capitalization = draft.capitalization;
    }
    // Rate period is optional (omitted = annual) for both types.
    if (draft.ratePeriod !== null) {
      resource.ratePeriod = draft.ratePeriod;
    }
    return resource;
  }

  toEntityFromResource(resource: SimulationResource): CreditSimulation {
    return new CreditSimulation({
      id: resource.id,
      clientId: resource.clientId,
      vehicleOfferId: resource.vehicleOfferId,
      salePrice: this.toMoney(resource.salePrice),
      rate: this.toRate(resource.rate),
      initialPercentage: new Percentage({value: resource.initialPercentage}),
      balloonPercentage: new Percentage({value: resource.balloonPercentage}),
      term: new Term({
        numberOfInstallments: resource.term.numberOfInstallments,
        frequencyDays: resource.term.frequencyDays,
        installmentsPerYear: resource.term.installmentsPerYear,
        daysPerYear: resource.term.daysPerYear,
      }),
      grace: resource.grace.map(grace => grace as GraceType),
      costs: resource.costs.map(cost => this.toCost(cost)),
      costOfCapital: this.toRate(resource.costOfCapital),
      loanAmount: this.toMoney(resource.loanAmount),
      financedBalance: this.toMoney(resource.financedBalance),
      indicators: new Indicators({
        npv: resource.indicators.npv,
        periodicIrr: resource.indicators.periodicIrr,
        tcea: resource.indicators.tcea,
        effectiveAnnualRate: resource.indicators.effectiveAnnualRate,
        periodicRate: resource.indicators.periodicRate,
        periodicCostOfCapital: resource.indicators.periodicCostOfCapital,
      }),
      schedule: resource.schedule.map(row => this.toScheduleRow(row)),
      summary: new SimulationSummary({
        totalInterest: resource.summary.totalInterest,
        totalAmortization: resource.summary.totalAmortization,
        totalLoanInstallments: resource.summary.totalLoanInstallments,
        totalToPay: resource.summary.totalToPay,
        totalsPerCost: Object.entries(resource.summary.totalsPerCost).map(
          ([name, total]) => new CostTotal({name, total}),
        ),
      }),
      state: resource.state as SimulationState,
      createdAt: resource.createdAt ? new Date(resource.createdAt) : null,
    });
  }

  toEntitiesFromResource(resources: SimulationResource[]): CreditSimulation[] {
    return resources.map(resource => this.toEntityFromResource(resource));
  }

  private toMoney(resource: {amount: number; currency: string}): Money {
    return new Money({amount: resource.amount, currency: resource.currency as Currency});
  }

  private toRate(resource: RateResource): Rate {
    return new Rate({
      value: resource.value,
      type: resource.type as RateType,
      capitalization: resource.capitalization,
      ratePeriod: resource.ratePeriod,
    });
  }

  private toCost(resource: CostResource): Cost {
    return new Cost({
      name: resource.name,
      value: resource.value,
      basis: resource.basis as CostBasis,
      timing: resource.timing as CostTiming,
      embedded: resource.embedded,
    });
  }

  private toCostResource(cost: Cost): CostResource {
    return {
      name: cost.name,
      value: cost.value,
      basis: cost.basis,
      timing: cost.timing,
      embedded: cost.embedded,
    };
  }

  private toScheduleRow(resource: ScheduleRowResource): ScheduleRow {
    return new ScheduleRow({
      period: resource.period,
      graceType: resource.graceType as GraceType,
      openingBalanceBalloon: resource.openingBalanceBalloon,
      interestBalloon: resource.interestBalloon,
      balloonCreditLifeInsurance: resource.balloonCreditLifeInsurance,
      closingBalanceBalloon: resource.closingBalanceBalloon,
      openingBalance: resource.openingBalance,
      interest: resource.interest,
      installment: resource.installment,
      amortization: resource.amortization,
      closingBalance: resource.closingBalance,
      cashFlow: resource.cashFlow,
      appliedCosts: resource.appliedCosts.map(
        cost => new AppliedCost({name: cost.name, amount: cost.amount}),
      ),
    });
  }
}

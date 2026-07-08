import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {Breadcrumbs} from '../../components/breadcrumbs/breadcrumbs';

/**
 * Integrated assistance view required by the academic statement: it gives field
 * guidance, the expected operation flow, and quick interpretation of the
 * financial indicators without leaving the application.
 */
@Component({
  selector: 'app-help',
  imports: [RouterLink, HlmButton, Breadcrumbs],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {
  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Ayuda'},
  ];

  protected readonly steps = [
    {
      title: 'Registra el vehículo',
      text: 'Crea una oferta con marca, modelo, año, precio y moneda. La moneda de la oferta define la moneda de la cotización.',
    },
    {
      title: 'Registra el cliente',
      text: 'Guarda documento, nombres y datos de contacto. Luego podrás consultar su historial de cotizaciones.',
    },
    {
      title: 'Configura el crédito',
      text: 'Selecciona cliente y oferta, completa tasa, plazo, gracia, cuotón, COK y costos aplicables.',
    },
    {
      title: 'Revisa el cronograma',
      text: 'Valida saldos, flujos, VAN, TIR y TCEA. Si cambia una condición, edita la cotización y vuelve a guardar.',
    },
  ];

  protected readonly fieldGroups = [
    {
      title: 'Cliente',
      items: [
        ['Tipo y número de documento', 'Identifican al deudor. El documento queda como referencia principal del cliente.'],
        ['Nombres y apellidos', 'Usalos como figuran en el documento para evitar duplicidades.'],
        ['Correo, teléfono y dirección', 'Son opcionales, pero ayudan al asesor a completar la oferta comercial.'],
      ],
    },
    {
      title: 'Oferta vehicular',
      items: [
        ['Marca, modelo y año', 'Describen el vehículo que se cotiza.'],
        ['Precio de venta', 'Base para cuota inicial, cuotón, seguros sobre precio y monto del préstamo.'],
        ['Moneda', 'La operación trabaja en una sola moneda: PEN o USD.'],
      ],
    },
    {
      title: 'Simulacion',
      items: [
        ['Tipo de tasa', 'Nominal requiere capitalización; efectiva puede declararse anual o por período.'],
        ['Período de tasa', 'Indica si el valor ingresado es anual, mensual u otro período en días.'],
        ['Cuota inicial y cuotón', 'Se ingresan como porcentaje del precio. La suma debe ser menor a 100%.'],
        ['Gracia total y parcial', 'Se aplican al inicio: total capitaliza intereses; parcial paga solo intereses.'],
        ['Costos', 'Fijos, sobre saldo o sobre precio. El desgravamen puede incluirse en la tasa ajustada.'],
        ['COK anual', 'Tasa de descuento del deudor usada para calcular el VAN.'],
      ],
    },
  ];

  protected readonly indicators = [
    ['VAN', 'Valor actual neto desde la óptica del deudor. Positivo indica que el financiamiento supera el COK ingresado.'],
    ['TIR periódica', 'Tasa que hace cero el VAN usando los flujos del cronograma.'],
    ['TCEA', 'Costo efectivo anual; anualiza la TIR periódica e incorpora cuotas, seguros y costos.'],
    ['TEA/TEM', 'Conversiones de tasa usadas por el motor para calcular intereses por periodo.'],
    ['Saldo a financiar', 'Parte del préstamo que se amortiza con cuotas regulares, descontando el valor presente del cuotón.'],
  ];

  protected readonly exampleRows = [
    ['Precio', '16,000 PEN'],
    ['Tasa', '15% TNA con capitalización diaria'],
    ['Cuota inicial / cuotón', '20% / 40%'],
    ['Plazo', '36 cuotas mensuales, 30/360'],
    ['Gracia', '3 totales y 3 parciales'],
    ['COK anual', '50%'],
    ['Costos', 'Notario 100, registral 75, desgravamen 0.049%, riesgo 4, GPS 20, portes 3.5, gastos adm. 3.5'],
  ];
}

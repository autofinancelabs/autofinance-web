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
      title: 'Registrar oferta',
      text: 'Crea el vehiculo con marca, modelo, anio, precio y moneda. El precio sera la base de inicial, cuoton y seguros.',
      action: 'Ir a vehiculos',
      link: '/vehicle-offers',
    },
    {
      title: 'Registrar cliente',
      text: 'Guarda documento, nombres y datos de contacto para asociar la cotizacion y consultar su historial.',
      action: 'Ir a clientes',
      link: '/clients',
    },
    {
      title: 'Configurar credito',
      text: 'Selecciona cliente y oferta; completa tasa, plazo, frecuencia, gracia, COK, cuoton y costos.',
      action: 'Nueva cotizacion',
      link: '/credit-simulations/new',
    },
    {
      title: 'Visualizar cronograma',
      text: 'Revisa el detalle por cuota: saldo, interes, amortizacion, seguros, gastos y flujo del periodo.',
      action: 'Ver cotizaciones',
      link: '/credit-simulations',
    },
    {
      title: 'Validar resultados',
      text: 'Confirma cuota, cuoton, TCEA, VAN y TIR antes de presentar la propuesta al cliente.',
      action: 'Ver cotizaciones',
      link: '/credit-simulations',
    },
  ];

  protected readonly fieldGroups = [
    {
      title: 'Tasa',
      icon: '%',
      items: [
        {label: 'Tipo de tasa', text: 'Nominal necesita capitalizacion; efectiva ya viene convertida al periodo declarado.'},
        {label: 'Valor (%)', text: 'Ingresa el porcentaje visible. Para 15% escribe 15, no 0.15.'},
        {label: 'Periodo y capitalizacion', text: 'Verifica si la tasa se declara anual, mensual u otro periodo, y si corresponde capitalizacion.'},
      ],
    },
    {
      title: 'Credito',
      icon: 'S/',
      items: [
        {label: 'Cuota inicial', text: 'Porcentaje del precio pagado al inicio por el cliente.'},
        {label: 'Cuota final', text: 'Cuoton balloon de Compra Inteligente, calculado sobre el precio del vehiculo.'},
        {label: 'Plazo', text: 'Cantidad de cuotas regulares. Con frecuencia 30, plazo 36 equivale a 36 meses.'},
      ],
    },
    {
      title: 'Gracia',
      icon: 'G',
      items: [
        {label: 'Gracia total', text: 'Periodo inicial sin pago; el interes se acumula en el saldo.'},
        {label: 'Gracia parcial', text: 'Periodo inicial donde se paga interes, pero no se amortiza capital.'},
        {label: 'Orden', text: 'Primero se aplican las cuotas de gracia total y luego las parciales.'},
      ],
    },
    {
      title: 'Costos',
      icon: '+',
      items: [
        {label: 'Monto fijo', text: 'Importe directo. Ejemplo: GPS 20 o gastos notariales 100.'},
        {label: '% sobre saldo', text: 'Depende del saldo pendiente; se usa para desgravamen.'},
        {label: '% sobre precio', text: 'Depende del valor del vehiculo; se usa para seguro de riesgo.'},
      ],
    },
  ];

  protected readonly checklist = [
    'Cliente y oferta vehicular seleccionados.',
    'Tasa, periodo y capitalizacion coinciden con la propuesta comercial.',
    'Inicial + cuoton es menor que 100%.',
    'Plazo, frecuencia y dias por anio coinciden con la propuesta financiera.',
    'Los costos iniciales y periodicos estan cargados con la base correcta.',
    'El desgravamen esta marcado como incluido en la tasa si la politica de la operacion lo requiere.',
  ];

  protected readonly costRows = [
    {name: 'Gasto notarial', value: 'Importe', basis: 'Monto fijo', timing: 'Inicial', note: 'Se considera al inicio de la operacion.'},
    {name: 'Gasto registral', value: 'Importe', basis: 'Monto fijo', timing: 'Inicial', note: 'Se considera al inicio de la operacion.'},
    {name: 'GPS', value: 'Importe', basis: 'Monto fijo', timing: 'Periodico', note: 'Se cobra junto con cada cuota.'},
    {name: 'Portes', value: 'Importe', basis: 'Monto fijo', timing: 'Periodico', note: 'Se cobra junto con cada cuota.'},
    {name: 'Gastos administrativos', value: 'Importe', basis: 'Monto fijo', timing: 'Periodico', note: 'Se cobra junto con cada cuota.'},
    {name: 'Desgravamen', value: 'Porcentaje', basis: '% sobre saldo', timing: 'Periodico', note: 'Puede incluirse en la tasa segun la politica comercial.'},
    {name: 'Seguro de riesgo', value: 'Porcentaje', basis: '% sobre precio', timing: 'Periodico', note: 'Se calcula sobre el valor del vehiculo.'},
  ];

  protected readonly indicators = [
    {label: 'Cuota', text: 'Pago regular calculado con metodo frances. En Compra Inteligente no incluye el cuoton final.'},
    {label: 'Saldo', text: 'Capital pendiente despues de cada periodo. Debe evolucionar segun gracia y amortizacion.'},
    {label: 'TCEA', text: 'Costo efectivo anual para el cliente, incorporando tasa, seguros y costos.'},
    {label: 'VAN', text: 'Valor actual neto usando el COK anual ingresado por el asesor.'},
    {label: 'TIR', text: 'Tasa que resume la rentabilidad o costo de los flujos del cronograma.'},
  ];
}

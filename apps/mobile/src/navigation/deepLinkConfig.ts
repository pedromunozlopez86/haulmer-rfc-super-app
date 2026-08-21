/**
 * Configuración de deep links para el App Host.
 *
 * Solo se acepta el esquema `cuenta://`.
 * El parámetro intentId se valida en el límite del módulo de pagos;
 * esta configuración solo define la estructura de enrutamiento.
 */
export const DEEP_LINK_PREFIXES = ['cuenta://'];

export const linking = {
  prefixes: DEEP_LINK_PREFIXES,
  config: {
    screens: {
      Home: '',
      PaymentFlow: {
        path: 'pay',
        parse: {
          // Pasa el parámetro sin modificar; la sanitización ocurre dentro de @haulmer/payments
          intentId: (id: string) => id,
        },
      },
    },
  },
};

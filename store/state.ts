import { PaypalState } from '../types/PaypalState'

export const state: PaypalState = {
  trans: null,
  methods: null,
  credentials: null,
  usingExpress: false,
  countries: [],
  fillingAfterExpress: false
}

import { Module } from 'vuex'
import { PaypalState } from '../types/PaypalState'
import { getters } from './getters'
import { actions } from './actions'
import { state } from './state'
import * as types from './mutation-types'
import Vue from 'vue'

export const module: Module<PaypalState, any> = {
  namespaced: true,
  state,
  actions,
  getters,
  mutations: {
    [types.SET_BACKEND_PAYMENT_PAYPAL_EXPRESS](state, paymentMethods) {
      state.methods = paymentMethods
    },
    [types.SET_PAYPAL_EXPRESS_CREDENTIALS](state, credentials) {
      Vue.set(state, 'credentials', credentials)
    },
    [types.SET_PAYPAL_EXPRESS_USING](state, usingExpress: Boolean) {
      state.usingExpress = usingExpress
    },
    [types.SET_COUNTRIES](state, countries: Array<any>) {
      state.countries = countries
    },
    [types.SET_FILLING](state, status: Boolean) {
      state.fillingAfterExpress = status
    }
    
  }
}

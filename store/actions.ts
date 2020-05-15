import { PaypalState } from '../types/PaypalState'
import { ActionTree } from 'vuex'
import config from 'config'
import { adjustMultistoreApiUrl } from '@vue-storefront/core/lib/multistore'
import { SET_FILLING, SET_PAYPAL_EXPRESS_CREDENTIALS, SET_PAYPAL_EXPRESS_USING, SET_COUNTRIES } from 'src/modules/payment-paypal/store/mutation-types'

// it's a good practice for all actions to return Promises with effect of their execution
export const actions: ActionTree<PaypalState, any> = {
  // complete({ }, params) {
  //   let url = config.paymentPaypalMagento2.endpoint.complete
  //   url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url
  //   return fetch(url, {
  //     method: 'POST',
  //     mode: 'cors',
  //     headers: {
  //       'Accept': 'application/json, text/plain, */*',
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(params)
  //   }).then(resp => { return resp.json() })
  // },
  async setExpressCheckout({ }, params) {
    let url = config.paymentPaypalMagento2.endpoint.setExpressCheckout
    url = config.storeViews.multistore ? adjustMultistoreApiUrl(url) : url
    try {
      return await (await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })).json()
    } catch (err) {
      console.log(err)
      // this.$store.dispatch('notification/spawnNotification', {
      //   type: 'error',
      //   message: i18n.t('Could not make an transaction via PayPal, sorry!'),
      //   action1: { label: i18n.t('OK'), action: 'close' }
      // })
    }
  },

  setCredentials ({ commit }, credentials) {
    commit(SET_PAYPAL_EXPRESS_CREDENTIALS, credentials)
  },

  usingExpress({ commit }, using: Boolean) {
    commit(SET_PAYPAL_EXPRESS_USING, using)
  },

  setCountries ({ commit }, countries) {
    commit(SET_COUNTRIES, countries)
  },

  fillingAfterExpress( { commit }, status) {
    commit(SET_FILLING, status)
  }
}

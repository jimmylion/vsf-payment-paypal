import { PaypalState } from '../types/PaypalState'
import { GetterTree } from 'vuex';

export const getters: GetterTree<PaypalState, any> = {
  hasCredentials: state => !!state.credentials,
  getCredentials: state => state.credentials,
}
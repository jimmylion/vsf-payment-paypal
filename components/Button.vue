<template>
  <div :class="express ? 'paypal-button--express' : 'paypal-button'" />
</template>

<script>
import store from '@vue-storefront/core/store'
import { currentStoreView } from '@vue-storefront/core/lib/multistore'
import config from 'config'
import i18n from '@vue-storefront/i18n'

export default {
  name: 'PaypalButton',
  props: {
    styling: {
      type: Object,
      required: false,
      default: () => ({
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      })
    },
    express: {
      type: Boolean,
      default: false
    }
  },
  data () {
    const storeView = currentStoreView()
    return {
      tokenId: null,
      currencyCode: storeView.i18n.currencyCode,
      locale: storeView.i18n.defaultLocale.replace('-', '_') // Converting to PayPal format,
    }
  },
  mounted () {
    this.setButtonAndTotals()
  },
  computed: {
    platformTotal () {
      return store.state.cart.platformTotalSegments
    }
  },
  methods: {

    setButtonAndTotals () {
      window.paypal.Buttons({
        style: this.styling,
        createOrder: this.createOrderNvp,
        onApprove: this.onApprove,
        onShippingChange: this.onShippingChange
      }).render(this.express ? '.paypal-button--express' : '.paypal-button')
    },

    getSegmentTotal (name) {
      const total = this.platformTotal.filter(segment => {
        return segment.code === name
      })
      if (total.length > 0) {
        if (this.$store.state.cart.platformTotals.base_discount_amount
        && this.$store.state.cart.platformTotals.base_discount_amount < 0 && name === 'subtotal') {
          return this.$store.state.cart.platformTotals.subtotal_incl_tax
        }

        if (name === 'tax') {
          if (this.$store.state.cart.platformTotals.shipping_incl_tax === 0) {
            return 0
          } else if (this.$store.state.cart.platformTotals.base_discount_amount && this.$store.state.cart.platformTotals.base_discount_amount < 0) {
            return 0
          } else {
            const onlyProductsTax = this.$store.state.cart.platformTotals.subtotal_incl_tax - this.$store.state.cart.platformTotals.subtotal_with_discount
            return Math.abs(onlyProductsTax.toFixed(2))
          }
        } else if (name === 'shipping') {
          if (this.$store.state.cart.platformTotals.shipping_incl_tax === 0) {
            return 0
          }
          if (this.$store.state.cart.platformTotals.base_discount_amount && this.$store.state.cart.platformTotals.base_discount_amount < 0) {
            return this.$store.state.cart.platformTotals.base_shipping_incl_tax
          }
          const onlyProductsTax = this.$store.state.cart.platformTotals.subtotal_incl_tax - this.$store.state.cart.platformTotals.subtotal_with_discount
          const shippingWithoutTax = this.$store.state.cart.platformTotals.shipping_incl_tax - onlyProductsTax
          return Math.abs(shippingWithoutTax.toFixed(2))
        } else {
          return Math.abs(parseFloat(total[0].value).toFixed(2))
        }
      } else {
        return 0
      }
    },

    getPurchaseUnits () {
      return [
        {
          reference_id: store.getters['cart/getCartToken'],
          // payment_instruction: '',
          description: 'Need to return an item? We accept returns for unused items in packaging 60 days after you order', // purchase description
          items: this.getProducts(),
          amount: this.getAmount(),
          ...(this.express ? {} : {shipping: this.getShippingAddress()})
        }
      ]
    },

    getProducts () {
      let products = []
      store.state.cart.cartItems.forEach(product => {
        products.push({
          name: product.name,
          unit_amount: {
            currency_code: this.currencyCode,
            value: product.special_price && product.isPack ? product.special_price : product.totals.price_incl_tax
          },
          // tax: {
          //   currency_code: this.currencyCode,
          //   // value: ''
          //   // optional tax already set in totals, this is not needed
          //   value: (product.totals.price_incl_tax - product.totals.price).toFixed(2)
          // },
          description: (product.options && product.options.length > 0) ? product.options.map((el) => { return el.value }).join(',') : '',
          quantity: product.qty,
          sku: product.sku,
          category: 'PHYSICAL_GOODS'
        })
      })
      return products
    },

    getBillingAddress () {
      return {
        address_line_1: store.state.checkout.paymentDetails.streetAddress,
        address_line_2: store.state.checkout.paymentDetails.apartmentNumber,
        admin_area_1: store.state.checkout.paymentDetails.region_code,
        admin_area_2: store.state.checkout.paymentDetails.city,
        postal_code: store.state.checkout.paymentDetails.zipCode,
        country_code: store.state.checkout.paymentDetails.country
      }
    },

    getShippingAddress () {
      return {
        name: {
          full_name: store.state.checkout.shippingDetails.firstName + ' ' + store.state.checkout.shippingDetails.lastName
        },
        address: {
          address_line_1: store.state.checkout.shippingDetails.streetAddress,
          address_line_2: store.state.checkout.shippingDetails.apartmentNumber,
          admin_area_1: store.state.checkout.shippingDetails.region_code,
          admin_area_2: store.state.checkout.shippingDetails.city,
          postal_code: store.state.checkout.shippingDetails.zipCode,
          country_code: store.state.checkout.shippingDetails.country
        }
      }
    },

    getAmount () {
      return {
        breakdown: {
          item_total: {
            currency_code: this.currencyCode,
            value: this.getSegmentTotal('subtotal')
          },
          shipping: {
            currency_code: this.currencyCode,
            value: this.getSegmentTotal('shipping')
          },
          discount: {
            currency_code: this.currencyCode,
            value: this.getSegmentTotal('discount')
          },
          tax_total: {
            currency_code: this.currencyCode,
            value: this.getSegmentTotal('tax')
          }
        },
        value: this.getSegmentTotal('grand_total'),
        currency_code: this.currencyCode
      }
    },

    async createOrderNvp (data, actions) {
      return store.dispatch('cart/syncTotals', {
        methodsData: {
          country: store.state.checkout.shippingDetails.country,
          zipCode: store.state.checkout.shippingDetails.zipCode,
          region: store.state.checkout.shippingDetails.region,
          region_id: store.state.checkout.shippingDetails.regionId,
          region_code: store.state.checkout.shippingDetails.regionCode,
          method_code: store.state.checkout.shippingDetails.shippingMethod,
          carrier_code: store.state.checkout.shippingDetails.shippingCarrier,
          payment_method: null
        },
        forceServerSync: true
      }).then(() => {
        // create order using Server Side methods same as magento 2....
        return store.dispatch('payment-paypal-magento2/setExpressCheckout', {
          cart_id: store.getters['cart/getCartToken'],
          brand_name: '',
          locale: this.locale,
          currency_code: this.currencyCode,
          purchase_units: this.getPurchaseUnits(),
          user_token: store.getters['user/getUserToken'],
          email: store.state.checkout.personalDetails.emailAddress,
          return_url: 'https://www.paypal.com/checkoutnow/error',
          cancel_url: 'https://www.paypal.com/checkoutnow/error',
          total_type: 'EstimatedTotal',
          logo: ''
        }).then((result) => {
          this.tokenId = result.token
          console.log(result)
          return this.tokenId
        }).catch(err => {
          this.$store.dispatch('notification/spawnNotification', {
            type: 'error',
            message: i18n.t('Could not make an transaction via PayPal, sorry!'),
            action1: { label: i18n.t('OK'), action: 'close' }
          })
        })
      })
    },

    async createOrderRest (data, actions) {
      return store.dispatch('cart/syncTotals', {
        methodsData: {
          country: store.state.checkout.shippingDetails.country,
          zipCode: store.state.checkout.shippingDetails.zipCode,
          region: store.state.checkout.shippingDetails.region,
          region_id: store.state.checkout.shippingDetails.regionId,
          region_code: store.state.checkout.shippingDetails.regionCode,
          method_code: store.state.checkout.shippingDetails.shippingMethod,
          carrier_code: store.state.checkout.shippingDetails.shippingCarrier,
          payment_method: null
        },
        forceServerSync: true
      }).then(() => {
        return actions.order.create({
          purchase_units: this.getPurchaseUnits()
        })
      })
    },

    async onApprove (data, actions) {
      const totals = this.$store.getters['cart/getTotals']
      // this.$store.commit('google-tag-manager/SET_ORDER_DETAILS', {
      //   total_due: totals.find((t) => t['code'].toString() === 'grand_total')['value'],
      //   tax_amount: totals.find((t) => t['code'].toString() === 'tax')['value'],
      //   shipping_amount: totals.find((t) => t['code'].toString() === 'shipping')['value'],
      //   coupon_code: this.$store.getters['cart/getCoupon'] ? this.$store.getters['cart/getCoupon']['code'] : '',
      //   cartId: this.$store.getters['cart/getCartToken']
      // })
      let additionalMethod = {
        paypal_express_checkout_token: this.tokenId ? this.tokenId : data.orderId,
        button: 1,
        paypal_express_checkout_payer_id: data.payerID,
        paypal_express_checkout_redirect_required: false
      }

      const capture = await actions.order.capture()

      if (capture.status !== 'COMPLETED') {
        return false
      }

      // console.log(capture)
      // debugger

      const payer = {
        email: capture.payer.email_address,
        country: capture.payer.address,
        firstname: capture.payer.name.given_name,
        lastname: capture.payer.name.surname,
        phone: capture.payer.phone.phone_number.national_number,
        fullname: `${capture.payer.name.given_name} ${capture.payer.name.surname}`,
        shipping: {
          address_line_1: capture.purchase_units[0].shipping.address.address_line_1,
          address_line_2: capture.purchase_units[0].shipping.address.address_line_2,
          ...(capture.purchase_units[0].shipping.address.admin_area_1 && !capture.purchase_units[0].shipping.address.admin_area_1.includes('=') && !capture.purchase_units[0].shipping.address.admin_area_1.includes('_') ? { region: capture.purchase_units[0].shipping.address.admin_area_1 } : {}),
          city: capture.purchase_units[0].shipping.address.admin_area_2,
          postal_code: capture.purchase_units[0].shipping.address.postal_code
        }
      }

      this.$store.dispatch('payment-paypal-magento2/setCredentials', additionalMethod)
      this.$emit('approved')
      if (this.express) {
        this.$store.dispatch('payment-paypal-magento2/usingExpress', true)
        this.$bus.$emit('paypal-instant-checkout-details', { payer })
        this.$bus.$emit('paypal-instant-checkout-shipping', { payer })
        this.$bus.$emit('paypal-instant-checkout-payment-method', { payer })
        this.$bus.$emit('paypal-instant-checkout-billing', { payer })
      }
    },

    async onShippingChange (data, actions) {
      try {
        this.$store.state.checkout.shippingDetails.country = data.shipping_address.country_code
        await this.$store.dispatch('cart/syncShippingMethods', {})
        const shippingMethods = this.$store.getters['shipping/shippingMethods']
        if (!shippingMethods || !shippingMethods.length) {
          return actions.resolve()
        }

        // Patch the shipping amount
        const shippingAmount = shippingMethods[0].price_excl_tax
        let discount = false
        let value = (parseFloat(this.getSegmentTotal('subtotal')) + parseFloat(shippingAmount)).toFixed(2)
        if (this.$store.state.cart.platformTotals.base_discount_amount && this.$store.state.cart.platformTotals.base_discount_amount < 0) {
          value = this.$store.state.cart.platformTotals.base_grand_total
          discount = {
            currency_code: this.currencyCode,
            value: this.getSegmentTotal('discount')
          }
        }

        return actions.order.patch([
            {
                op: 'replace',
                path: '/purchase_units/@reference_id==\'default\'/amount',
                value: {
                    currency_code: this.currencyCode,
                    value,
                    breakdown: {
                        item_total: {
                            currency_code: this.currencyCode,
                            value: this.getSegmentTotal('subtotal')
                        },
                        shipping: {
                            currency_code: this.currencyCode,
                            value: shippingAmount
                        },
                        ...(discount ? {discount} : {})
                    }
                }
            }
        ]);

        console.log(data, actions)
      } catch (err) {
        console.log('lel', err)
      }
      return actions.resolve()
    },

    onCancel (data) {
      this.$emit('payment-paypal-cancelled', data)
    }
  }
}
</script>

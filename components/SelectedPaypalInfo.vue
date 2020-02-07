<template functional>
  <div class="paypal-payment-step-information">
    <img src="../assets/paypalLogo.svg" alt="PayPal" class="paypal__logo">
    <p class="paypal__info">{{ parent.$t('Pay with PayPal on last step') }}</p>
  </div>
</template>

<style lang="scss" scoped>
  .paypal-payment-step-information {
    min-height: 180px;
    @include flex($place: center, $direction: column);
  }

  .paypal {
    &__logo {
      max-width: 150px;
    }
    &__info {
      margin: 30px 0;
    }
  }
</style>
const mappingPaypalM2 = {
  'MX': {
    // Paypal: Magento2
    'AGS': 'AGU',
    'BC': 'BCN',
    'CAMP': 'CAM',
    'CHIS': 'CHP',
    'CHIH': 'CHH',
    'CDMX': 'DF',
    'COAH': 'COA',
    //'DF': '?', // Districto federal - does not exist in m2
    'DGO': 'DUR',
    'GTO': 'GUA',
    'HGO': 'HID',
    'MICH': 'MIC',
    'NL': 'NLE',
    'QRO': 'QUE',
    'Q ROO': 'ROO',
    'TAMPS': 'TAM',
    'TLAX': 'TLA'
  }
}

const mappingM2Paypal = {
  // Reversed mappingPaypalM2 object
  'MX': Object.entries(mappingPaypalM2.MX).reduce((total, curr) => {
    total[curr[1]] = curr[0]
    return total
  }, {})
}

export default {
  methods: {
    paypalRegionCodeToM2 (countryCode: string, regionCode: string): string {
      if (mappingPaypalM2[countryCode] && mappingPaypalM2[countryCode][regionCode]) {
        return mappingPaypalM2[countryCode][regionCode]
      }
      return regionCode
    },
    m2RegionCodeToPaypal (countryCode: string, regionCode: string): string {
      if (mappingM2Paypal[countryCode] && mappingM2Paypal[countryCode][regionCode]) {
        return mappingM2Paypal[countryCode][regionCode]
      }
      return regionCode
    }
  }
}
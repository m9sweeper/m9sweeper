import {makeGaugeProvider} from "@willsoto/nestjs-prometheus";

export const prometheusGauges = [
  makeGaugeProvider({
    name: 'dash_active_exceptions',
    help: 'Counting number of Active Exceptions'
  }),
  makeGaugeProvider({
    name: 'dash_expiring_exceptions_tomorrow',
    help: 'Counting number of Active Exceptions that will expire tomorrow'
  }),
  makeGaugeProvider({
    name: 'dash_num_of_unscanned_images',
    help: 'Number of total Image Scans'
  }),
  makeGaugeProvider({
    name: 'dash_num_of_compliant_images',
    help: 'Number of Images that are Compliant'
  }),
  makeGaugeProvider({
    name: 'dash_num_of_non_compliant_images',
    help: 'Number of Images that are not Compliant'
  })
]

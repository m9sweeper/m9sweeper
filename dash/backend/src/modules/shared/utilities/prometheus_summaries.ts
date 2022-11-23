import {makeSummaryProvider} from "@willsoto/nestjs-prometheus";

export const prometheusSummaries = [
    makeSummaryProvider({
        name: 'dash_responses',
        help: 'Response time in milliseconds',
        labelNames: ['method', 'route', 'status']
    }),
    makeSummaryProvider({
        name: 'dash_active_exception',
        help: 'Active exception details.',
        labelNames: ['name', 'remaining_time'],
        percentiles: [0.01, 0.99]
    })
]

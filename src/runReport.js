const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const analyticsDataClient = new BetaAnalyticsDataClient();

const runReport = async (startDate, endDate, propertyId, pathFilter) => {
    const [results] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ "name": "eventName" }],
        metrics: [{ "name": "eventCount" }, { "name": "totalUsers" }],
        dimensionFilter: {
            "andGroup": {
                "expressions": [
                    {
                        "filter": {
                            "fieldName": "eventName",
                            "stringFilter": {
                                "matchType": "EXACT",
                                "value": "page_view", "caseSensitive": false
                            }
                        }
                    }, {
                        "filter": {
                            "fieldName": "fullPageUrl",
                            "stringFilter": {
                                "matchType": "CONTAINS",
                                "value": pathFilter,
                                "caseSensitive": false
                            }
                        }
                    }
                ]
            }
        },
        limit: 100,
    })

    return results.rows
}


const init = async () => {
    const pathToFilter  = [
        "/path/to/content/001",
        "/path/to/content/002",
        "/path/to/content/003",
        "/path/to/content/004",
        "/path/to/content/005",
    ]

    const startDate = "2024-04-01"
    const endDate = "2024-04-30"
    const propertyId = ""
    const data = []
    let somaPV = 0
    let somaUsers = 0

    for (let a = 0; a < pathToFilter.length; a++) {
        console.log(`Executando relatório para o path: ${pathToFilter[a]}`)
        const results = await runReport(startDate, endDate, propertyId, pathToFilter[a]);

        const pageViews = parseInt(results[0].metricValues[0]["value"])
        const users     = parseInt(results[0].metricValues[1]["value"])

        data.push({
            "url_contains": pathToFilter[a],
            "page_views": pageViews,
            "total_users": users
        });
        somaPV += pageViews
        somaUsers += users
    }

    console.log('Resultados:');
    console.table(data)
    console.table({
        "property": propertyId,
        "start_date": startDate,
        "end_date": endDate,
        "total_pageviews": somaPV,
        "total_users": somaUsers,
    })
}

init()
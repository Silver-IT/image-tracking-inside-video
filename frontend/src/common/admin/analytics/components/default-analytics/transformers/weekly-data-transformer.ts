import { WeeklyPageViews } from '../../../types/site-analytics-data';
import { timestampToDayName } from '../utils/timestamp-to-day-name';
import {ChartType, LineChartConfig} from '@common/shared/charts/base-chart';

export function transformWeeklyData(weeklyData: WeeklyPageViews): LineChartConfig {
    const config = {
        type: ChartType.LINE,
        labels: [],
        tooltip: 'Pageviews',
        data: [[], []]
    } as LineChartConfig;

    weeklyData && weeklyData.current.forEach((weekData, key) => {
        config.labels.push(timestampToDayName(weekData.date));

        // current week data
        config.data[0].push(weekData.pageViews);

        // previous week data
        config.data[1].push(weeklyData.previous[key].pageViews);
    });

    return config;
}

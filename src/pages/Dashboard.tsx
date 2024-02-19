import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Select } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label } from 'recharts';


import { useModel } from '@umijs/max';
import { fetchChartData } from '@/services/chartService';

const NewChartPage = () => {
    const { initialState } = useModel('@@initialState');
    const [blockchain, setBlockchain] = useState('');
    const [subChain, setSubChain] = useState('');
    const [metric, setMetric] = useState('');
    const [timeRange, setTimeRange] = useState('7_days');
    const [chartData, setChartData] = useState([]);
    const [description, setDescription] = useState("");

    // Extract blockchains from initialState
    const blockchains = Object.keys(initialState?.blockchainData || {});

    // Update subChains based on selected blockchain
    const subChains = blockchain ? Object.keys(initialState?.blockchainData[blockchain] || {}) : [];

    // Update metricsList based on selected subChain
    const metricsList = subChain ? initialState?.blockchainData[blockchain][subChain] || [] : [];

    useEffect(() => {
        if (blockchain && subChain && metric && timeRange) {
            fetchChartData(blockchain, subChain, metric, timeRange).then(response => {
                const transformedData = response.data['chart_data'].map(item => ({
                    date: new Date(item.date).toLocaleDateString(),
                    value: item.value,
                }));
                setChartData(transformedData);
                setDescription(response.data['util_data'].description || '')
            }).catch(error => {
                console.error('API call failed:', error);
            });
        }
    }, [blockchain, subChain, metric, timeRange]);
    
    const config = {
        data: chartData,
        height: 400,
        xField: 'date',
        yField: 'value',
        colorField: 'blue', 
        size: 100,
        point: {
            size: 100, // Reduced size for visibility
            shape: 'diamond',
            style: { fill: 'yellow' },
        },
    };
    

    return (
        <PageContainer>
            <Card title="Chart">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    {/* Blockchain Selector */}
                    <div>
                        <label style={{ marginRight: 10 }}>Blockchain:</label>
                        <Select style={{ width: 120 }} value={blockchain} onChange={setBlockchain}>
                            {blockchains.map(bc => (
                                <Select.Option key={bc} value={bc}>{bc}</Select.Option>
                            ))}
                        </Select>
                    </div>
                    
                    {/* Sub Chain Selector */}
                    {blockchain && (
                        <div>
                            <label style={{ marginRight: 10 }}>Sub Chain:</label>
                            <Select style={{ width: 120 }} value={subChain} onChange={setSubChain}>
                                {subChains.map(sc => (
                                    <Select.Option key={sc} value={sc}>{sc}</Select.Option>
                                ))}
                            </Select>
                        </div>
                    )}

                    {/* Metric Selector */}
                    {subChain && (
                        <div>
                            <label style={{ marginRight: 10 }}>Metric:</label>
                            <Select style={{ width: 200 }} value={metric} onChange={setMetric}>
                                {metricsList.map(m => (
                                    <Select.Option key={m} value={m}>{m}</Select.Option>
                                ))}
                            </Select>
                        </div>
                    )}

                    {/* Time Range Selector */}
                    <div>
                        <label style={{ marginRight: 10 }}>Time Range:</label>
                        <Select style={{ width: 120 }} value={timeRange} onChange={setTimeRange}>
                            <Select.Option value="7_days">7 days</Select.Option>
                            {/* Additional options can be added here */}
                        </Select>
                    </div>
                </div>

                {/* Line Chart */}
                <Card>


                <LineChart
                width={1100}
                height={400}
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                {/* Adjusting CartesianGrid stroke color to grey */}
                <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" strokeOpacity={0.1} /> {/* grey color */}
                <XAxis
                    dataKey="date"
                    stroke="white" // Keeping the axis line color white
                    tick={{ fill: 'yellow' }} // Changing the tick values to yellow
                >
                    {/* X Axis Title */}
                    <Label value="Date" offset={-10} position="insideBottomRight" fill="yellow" />
                </XAxis>
                <YAxis
                    stroke="white" // Keeping the axis line color white
                    tick={{ fill: 'yellow' }} // Changing the tick values to yellow
                >
                    {/* Y Axis Title */}
                    <Label value="Value" angle={-90} position="insideLeft" offset={10} fill="yellow" />
                </YAxis>
                <Tooltip />
                <Legend wrapperStyle={{ color: 'yellow' }} />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="blue"
                    activeDot={{ r: 8, stroke: 'yellow', strokeWidth: 2, fill: 'yellow' }}
                    strokeWidth={2}
                    dot={{
                        stroke: 'yellow',
                        strokeWidth: 2,
                        fill: 'yellow',
                        r: 4,
                    }}
                />
            </LineChart>

                </Card>

                {/* Custom Description Div */}
                <div style={{ marginTop: 20 }}>
                    {/* Displaying dynamic description based on utilData */}
                    <p>{description}</p>
                </div>
            </Card>
        </PageContainer>
    );
};

export default NewChartPage;

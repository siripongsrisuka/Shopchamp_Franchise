import React from 'react';
import {
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  LineChart,
} from 'recharts';
import { colors } from '../configs';

const { primaryColor, dark } = colors;

  const CustomTooltip = ({ active, payload, label, value }) => {
    const { name, content } = value;
    if (active && payload && payload.length) {
      console.log('payload')
      console.log(payload)
      return (
        <div style={{backgroundColor:'rgba(255,255,255, 0.5)',borderRadius:20,padding:10}}>
          <p className="label">{`${name} ${label} : ${content} ${payload[1].value.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}`}</p>
        </div>
      );
    }
  
    return null;
  };


function LineChartScreen({ chart, lines=[] }) {

    return (
        <ResponsiveContainer width="100%" height="100%"  >
            <LineChart width={500} height={300} data={chart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
            {/* <YAxis /> */}
            <YAxis padding={{ top: 20 }} /> 
            <Tooltip />
            {/* <Tooltip content={<CustomTooltip value={{ name, content }} />} /> */}
            <Legend />
            {/* <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} /> */}
            {/* <Line type="monotone" dataKey="uv" stroke="#82ca9d" /> */}
            {lines.map((a,i)=>{
              return <Line key={i} type="monotone" dataKey={a.name} stroke={a.color} />
            })}
            </LineChart>
        </ResponsiveContainer>
    );
  }
  
  export default LineChartScreen;

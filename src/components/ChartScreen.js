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
  BarChart
} from 'recharts';
import { colors } from '../configs';

const { primaryColor, dark } = colors;

  const CustomTooltip = ({ active, payload, label, value }) => {
    const { name, content } = value;
    if (active && payload && payload.length) {
      return (
        <div style={{backgroundColor:'rgba(255,255,255, 0.5)',borderRadius:20,padding:10}}>
          <p className="label">{`${name} ${label} : ${content} ${payload[0].value.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}`}</p>
        </div>
      );
    }
  
    return null;
  };


function ChartScreen({ chart,bar, name, content }) {

    return (
        <ResponsiveContainer width="100%" height="90%" minWidth={900} >
          <BarChart
            width={150}
            height={40}
            data={chart}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Adjust this to add margin
          >
            <Bar dataKey={bar} fill={primaryColor} label={{ position: 'top' }} />
            <XAxis dataKey="name" stroke={dark} />
            <YAxis padding={{ top: 20 }} /> {/* Adds 20% padding on top */}
            <Tooltip content={<CustomTooltip value={{ name, content }} />} />
            <CartesianGrid strokeDasharray="3 3" />
            <Area type="monotone" dataKey="amt" fill={primaryColor} stroke={primaryColor} />
            <Line type="monotone" dataKey="pv" stroke={primaryColor} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
    );
  }
  
  export default ChartScreen;

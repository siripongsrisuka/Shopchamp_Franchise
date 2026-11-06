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

const { primaryColor } = colors;
// DEV-0002 แกนสีเทากลางแบบเว็บพี่น้อง (recharts ใส่ CSS var ใน attribute SVG ไม่ได้ ⇒ ใช้ค่าเดียวกับ --sc-muted)
const AXIS = '#8A8276';
const MAX_BAR_WIDTH = 36;
const BAR_RADIUS = [8, 8, 0, 0];

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
            <Bar dataKey={bar} fill={primaryColor} label={{ position: 'top', fill: AXIS }} maxBarSize={MAX_BAR_WIDTH} radius={BAR_RADIUS} />
            <XAxis dataKey="name" stroke={AXIS} />
            <YAxis padding={{ top: 20 }} stroke={AXIS} /> {/* Adds 20% padding on top */}
            <Tooltip content={<CustomTooltip value={{ name, content }} />} />
            <CartesianGrid strokeDasharray="3 3" stroke="#ECE7DF" />
            <Area type="monotone" dataKey="amt" fill={primaryColor} stroke={primaryColor} />
            <Line type="monotone" dataKey="pv" stroke={primaryColor} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
    );
  }
  
  export default ChartScreen;

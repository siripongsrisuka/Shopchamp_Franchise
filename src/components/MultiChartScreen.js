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

  const CustomTooltip = ({ active, payload, }) => {
    if (active && payload && payload.length) {
      console.log(payload)
      return (
        <div style={{backgroundColor:'rgba(255,255,255, 0.5)',borderRadius:20,padding:10}}>
          {payload.map((a,i)=>{
            return <p key={i} >[{a.payload.name}]{a.name} {a.value?.toLocaleString(undefined, {minimumFractionDigits: 2,maximumFractionDigits: 2})}</p>
          })}
        </div>
      );
    }
  
    return null;
  };


function MultiChartScreen({ chart,bars, name, content }) {


      const colors = {
        0:'orange',
        1:'red',
        2:'green',
        3:'blue',
        4:'yellow',
        5:'dark',
        6:'pink'
      }
    return (
        <ResponsiveContainer width="100%" height="90%">
          <BarChart
            width={150}
            height={40}
            data={chart}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }} // Adjust this to add margin
          >
            {bars.map((a,i)=>{
                return <Bar dataKey={a.name} stackId="a" fill={a.color} />
            })}
            
            {/* <Bar dataKey="uv" stackId="a" fill="#82ca9d" />
            <Bar dataKey="amt" stackId="a" fill="red" /> */}
            <XAxis dataKey="name" stroke={dark} />
            <YAxis padding={{ top: 20 }} /> {/* Adds 20% padding on top */}
            <Tooltip content={<CustomTooltip value={{ name:'pv', content:'uv'}} />} />
            <CartesianGrid strokeDasharray="3 3" />
            <Area type="monotone" dataKey="amt" fill={primaryColor} stroke={primaryColor} />
            <Line type="monotone" dataKey="pv" stroke={primaryColor} />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
    );
  }
  
  export default MultiChartScreen;

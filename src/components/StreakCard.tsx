
import { Card, CardContent, Typography } from '@mui/material'; import React from 'react';
export default function StreakCard({count}:{count:number}){
 return (<Card variant="outlined" sx={{borderRadius:3}}><CardContent sx={{display:'flex',gap:2,alignItems:'center'}}>
  <span style={{fontSize:28}}>🔥</span><div><Typography variant="h6" sx={{fontWeight:800}}>{count} day{count===1?'':'s'}</Typography><Typography variant="body2" color="text.secondary">Current streak</Typography></div>
 </CardContent></Card>);
}

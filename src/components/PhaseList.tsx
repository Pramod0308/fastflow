
import { Box, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material'; import React from 'react'; import { PHASES } from '../lib/stats';
export default function PhaseList({hours}:{hours:number}){
  return (<List dense sx={{bgcolor:'background.paper',borderRadius:3,p:1}}>
    {PHASES.map(p=>{ const reached=hours>=p.hours; return (
      <ListItem key={p.label} sx={{borderRadius:2,mb:.5,...(reached && {bgcolor:'rgba(0,137,123,.08)'})}}>
        <ListItemIcon sx={{minWidth:36,opacity:reached?1:.45}}><span style={{fontSize:20}}>{p.icon}</span></ListItemIcon>
        <ListItemText primary={p.label} secondary={`${p.hours}h — ${p.desc}`} primaryTypographyProps={{fontWeight:700}} secondaryTypographyProps={{fontWeight:400}} />
        <Box><Chip size="small" color={reached?'success':'default'} label={reached?'Reached':'Locked'} /></Box>
      </ListItem> );})}
  </List>);
}

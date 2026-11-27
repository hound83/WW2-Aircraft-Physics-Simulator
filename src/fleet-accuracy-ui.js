'use strict';

const FleetAccuracyUI=(()=>{
  function setup({data,text,appendTable,shortName,fmt}) {
    const a=data.accuracy, get=id=>document.getElementById(id);
    const low=get('bench-chart-low'), high=get('bench-chart-high'), target=get('bench-chart-times');
    function showTimes() {
      target.replaceChildren();
      const from=low.valueAsNumber, to=high.valueAsNumber;
      if(!(from>0 && to>from)) {
        target.append(text('p','Enter a positive start speed and a higher target.'));
        return;
      }
      const readings=a.transfers.map(s=>({s,w:FleetComparison.speedWindow(s.trace,from,to,s.allowance)}));
      const rows=readings.map(({s,w})=>{
        const range=w.lower!==null && w.upper!==null ? fmt(w.lower)+'–'+fmt(w.upper)+' s' : 'Outside chart coverage';
        return [s.aircraft,w.seconds===null?'Outside recorded trace':fmt(w.seconds)+' s',w.seconds===null?'—':range,s.applicability];
      });
      appendTable(target,['Test aircraft',from+'–'+to+' KIAS','Chart reading range','Test installation'],rows);
      const ranked=readings.filter(r=>Number.isFinite(r.w.seconds)).sort((a,b)=>a.w.seconds-b.w.seconds);
      if(ranked.length>=2) {
        const [leader,...others]=ranked;
        const overlaps=others.filter(r=>leader.w.upper===null || r.w.lower===null || r.w.lower<=leader.w.upper);
        const detail=overlaps.length ? 'The reading ranges overlap or are incomplete for '+overlaps.map(r=>r.s.aircraft).join(', ')+'.' :
          'Its upper reading bound is below each other comparable aircraft’s lower bound.';
        target.append(text('p',leader.s.aircraft+' has the shortest central time. '+detail));
      }
    }
    low.addEventListener('input',showTimes);
    high.addEventListener('input',showTimes);
    showTimes();

    const summary=get('bench-accuracy-summary'), reports=get('bench-accuracy-campaigns');
    summary.append(text('p','The operating model uses the 4.19 calibration. We tested extra induced power loss on all 14 propeller installations. The modest improvement in climb and acceleration came with larger turn errors.'));
    const p=a.partitions, g=a.guards;
    const scores=[['Development climb · '+p.development.campaigns+' reports',p.development,'s'],
      ['Reserved climb · '+p.reserved.campaigns+' reports',p.reserved,'s'],
      ['Restored Mustang acceleration proxy',g.mustangAcceleration,'s'],
      ['EN.524 separate-airframe level speed',g.separateLevel,'mph TAS'],
      ['Restored Mustang sustained load proxy',g.sustainedLoad,'g'],
      ['Finnish G-2 turn, nominal assumptions',g.finnishTurn,'s']];
    appendTable(summary,['Mean absolute error','Intervals / points','Operating model','Extra loss test'],
      scores.map(([label,r,unit])=>[label,r.count,fmt(r.control,3)+' '+unit,fmt(r.test,3)+' '+unit]));
    summary.append(text('p','Each climb report has equal weight. The reserve contains entire reports kept out of this experiment. Earlier simulator work had access to them.','bench-note'));
    appendTable(summary,['Climb lead at test conditions','Measured','Operating model','Extra loss test'],a.focus.map(r=>[
      shortName(r.left)+' over '+shortName(r.right)+' · '+fmt(r.fromFt,0)+'–'+fmt(r.toFt,0)+' ft',
      fmt(r.observed)+' s',fmt(r.control)+' s',fmt(r.test)+' s']));
    const bands=a.errorBands;
    summary.append(text('p',bands.highCount+' of '+bands.count+' intervals start at or above 20,000 ft. They account for '+fmt(100*bands.highShare,0)+'% of the absolute clock error. Longer and slower climb intervals have more influence on this total.'));
    appendTable(reports,['Aircraft / report','Use','Intervals','Operating MAE (s)','Test MAE (s)'],a.clocks.map(c=>[
      shortName(c.id)+' · '+c.bands[0].trial,c.partition,c.count,fmt(c.control,2),fmt(c.test,2)]));
    for(const c of a.clocks) {
      const row=text('p',shortName(c.id)+' · '+c.bands[0].trial+' · ','bench-note');
      const link=text('a','Flight report');link.href=c.source;link.target='_blank';link.rel='noopener';row.append(link);reports.append(row);
    }
    const box=get('bench-accuracy-fleet');
    box.append(text('p','Half internal fuel, dry Combat. Climb is sea level to 10,000 ft. Acceleration is 180–250 mph EAS at 10,000 ft. Each cell gives operating / test seconds.'));
    appendTable(box,['Aircraft','Climb (s)','Acceleration (s)'],a.aircraft.map(r=>[r.name,
      fmt(r.control.elapsed)+' / '+fmt(r.test.elapsed),fmt(r.control.acceleration)+' / '+fmt(r.test.acceleration)]));
  }
  return {setup};
})();

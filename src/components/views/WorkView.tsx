import React, { useMemo, useRef, useState } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Pencil, Trash2,
  Bell, Clock, X, RotateCcw,
} from 'lucide-react';
import { WorkCategory, WorkPriority, WorkStore, WorkTask } from '../../../types/work';
import { shiftDate, getTodayDateString } from '../../logic/calculations';
import { HandwrittenCheckbox } from '../HandwrittenDoodles';

interface Props { store: WorkStore; onChange: (next: WorkStore) => void; }
const newId = () => `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const emptyTask = (date: string, categoryId: string): WorkTask => ({
  id: newId(), title: '', description: '', date, time: '', categoryId, priority: 'Medium',
  completed: false, remindersEnabled: false, reminderOffsets: [1440], alarmEnabled: false,
  repeat: 'none', repeatUntil: '', notes: '', createdAt: new Date().toISOString(),
});
const fmtDate = (date: string) => { const [y,m,d] = date.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); };
const priorityStyle: Record<WorkPriority, string> = {
  Low: 'bg-[#E7F1E8] text-[#39734A] border-[#A9C9AE]',
  Medium: 'bg-[#FFF3D2] text-[#987018] border-[#E8D08A]',
  High: 'bg-[#F9E2E4] text-[#A3263B] border-[#E2AAB3]',
};

export const WorkView: React.FC<Props> = ({ store, onChange }) => {
  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [editing, setEditing] = useState<WorkTask | null>(null);
  const [reminderPreset, setReminderPreset] = useState('60');
  const dateInputRef = useRef<HTMLInputElement>(null);
  const dateObj = new Date(`${selectedDate}T12:00:00`);
  const year = dateObj.getFullYear(), month = dateObj.getMonth(), day = dateObj.getDate();
  const weekdayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const dayOfWeek = dateObj.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDateStr = shiftDate(selectedDate, diffToMonday);
  const weekDays = Array.from({length:7},(_,offset)=>{
    const dateStr=shiftDate(mondayDateStr,offset);
    const d=new Date(`${dateStr}T12:00:00`);
    const dayTasks=store.tasks.filter(t=>t.date===dateStr);
    const completed=dayTasks.filter(t=>t.completed).length;
    return {dateStr,dayName:d.toLocaleDateString('en-US',{weekday:'short'}),dayNum:d.getDate(),isSelected:dateStr===selectedDate,isDayToday:dateStr===today,hasSomeDone:completed>0,isAllDone:dayTasks.length>0&&completed===dayTasks.length,hasTasks:dayTasks.length>0};
  });
  const dateTasks = useMemo(() => store.tasks.filter(t => t.date === selectedDate), [store.tasks, selectedDate]);

  const handleOpenDatePicker = () => {
    try { if (dateInputRef.current && 'showPicker' in dateInputRef.current) dateInputRef.current.showPicker(); else { dateInputRef.current?.focus(); dateInputRef.current?.click(); } }
    catch { dateInputRef.current?.focus(); dateInputRef.current?.click(); }
  };
  const saveTask = () => {
    if (!editing || !editing.title.trim()) return;
    const normalized = {...editing, title:editing.title.trim(), categoryId:editing.categoryId || store.categories[0]?.id || ''};
    const exists = store.tasks.some(t=>t.id===normalized.id);
    onChange({...store,tasks: exists ? store.tasks.map(t=>t.id===normalized.id?normalized:t) : [...store.tasks,normalized]});
    setEditing(null);
  };
  const toggleDone = (task: WorkTask) => {
    const completing = !task.completed;
    const nextTasks = store.tasks.map(t=>t.id===task.id?{...t,completed:completing,completedAt:completing?new Date().toISOString():undefined}:t);
    onChange({...store,tasks:nextTasks});
  };
  const deleteTask = (task: WorkTask) => { if (window.confirm(`Delete "${task.title}"?`)) onChange({...store,tasks:store.tasks.filter(t=>t.id!==task.id)}); };
  const addReminder = () => {
    if (!editing) return;
    const mins=Number(reminderPreset);
    if (editing.reminderOffsets.includes(mins)) return;
    setEditing({...editing,remindersEnabled:true,reminderOffsets:[...editing.reminderOffsets,mins].sort((a,b)=>b-a)});
  };
  const openNewTask = () => setEditing(emptyTask(selectedDate, store.categories[0]?.id || ''));

  return <div className="space-y-2.5 sm:space-y-3 font-handwriting text-[#1B3A57]" id="work-dashboard">
    <div id="work-date-window" className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-2 sm:p-2.5 shadow-sm space-y-1.5 select-none text-[#1B3A57]">
      <div className="flex items-center justify-between gap-1.5">
        <button type="button" onClick={()=>setSelectedDate(shiftDate(selectedDate,-1))} className="p-1.5 rounded-lg text-[#9B1B30] hover:bg-[#F5E4E7]" aria-label="Previous Day"><ChevronLeft className="w-4 h-4 stroke-[2.2]"/></button>
        <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
          <button type="button" onClick={handleOpenDatePicker} className="group flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border border-[#D6DCE8] bg-[#F1ECE1] min-w-0">
            <CalendarDays className="w-3.5 h-3.5 text-[#9B1B30] shrink-0"/>
            <div className="flex items-center gap-1 min-w-0"><span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-[#1B3A57] text-white">{weekdayShort}</span><span className="text-xs sm:text-sm font-bold truncate">{day} {monthShort} {year}</span></div>
          </button>
          <input ref={dateInputRef} type="date" value={selectedDate} onChange={e=>e.target.value&&setSelectedDate(e.target.value)} className="sr-only" aria-hidden="true" tabIndex={-1}/>
          {selectedDate===today ? <span className="text-[9px] font-bold text-white bg-[#9B1B30] border border-[#9B1B30] px-2 py-0.5 rounded-full shrink-0">Today</span> : <button type="button" onClick={()=>setSelectedDate(today)} className="flex items-center gap-1 text-[9px] font-bold text-[#1B3A57] bg-[#F1ECE1] border border-[#D6DCE8] px-2 py-0.5 rounded-full shrink-0"><RotateCcw className="w-2.5 h-2.5 text-[#9B1B30]"/><span>Today</span></button>}
        </div>
        <button type="button" onClick={()=>setSelectedDate(shiftDate(selectedDate,1))} className="p-1.5 rounded-lg text-[#9B1B30] hover:bg-[#F5E4E7]" aria-label="Next Day"><ChevronRight className="w-4 h-4 stroke-[2.2]"/></button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 pt-1 border-t border-[#E5DDD0]">
        {weekDays.map(item=><button key={item.dateStr} type="button" onClick={()=>setSelectedDate(item.dateStr)} className={`flex flex-col items-center justify-center py-1 sm:py-1.5 rounded-lg transition-all relative ${item.isSelected?'bg-[#1B3A57] text-white shadow-md font-bold scale-[1.01]':item.isDayToday?'bg-[#F5E4E7] text-[#9B1B30] font-bold border border-[#E1B9C0]':'hover:bg-[#EFE9DF] text-[#78716C]'}`}>
          <span className={`text-[8px] sm:text-[9px] uppercase tracking-wider ${item.isSelected?'text-white/80 font-semibold':item.isDayToday?'text-[#9B1B30]':'text-[#78716C]'}`}>{item.dayName.slice(0,3)}</span>
          <span className={`text-xs sm:text-sm font-mono font-bold leading-tight ${item.isSelected?'text-white':item.isDayToday?'text-[#9B1B30]':'text-[#1B3A57]'}`}>{item.dayNum}</span>
          <div className="flex items-center gap-0.5 mt-0 h-1">{item.hasTasks?<span className={`w-1 h-1 rounded-full ${item.isSelected?'bg-white':item.isAllDone?'bg-[#607C68]':'bg-[#9B1B30]'}`}/>:null}</div>
        </button>)}
      </div>
    </div>

    <section className="bg-[#FAF7F0] rounded-xl shadow-sm text-[#1B3A57] overflow-hidden">
      <div className="bg-[#1B3A57] rounded-t-xl px-2.5 sm:px-3 py-2.5 flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-[#FAF7F0] tracking-wider uppercase font-fancy">{dateObj.toLocaleDateString('en-US',{weekday:'long'})}'S WORK</h2>
        <button type="button" onClick={openNewTask} className="flex items-center gap-1 text-[11px] font-bold text-white rounded-lg px-2 py-1 border border-white/30 hover:bg-white/10"><Plus className="w-3.5 h-3.5"/> Add Task</button>
      </div>
      <div className="bg-[#FAF7F0] rounded-lg mt-1.5 p-1.5 space-y-0.5">
        {dateTasks.map(task=><TaskRow key={task.id} task={task} onDone={()=>toggleDone(task)} onEdit={()=>setEditing(task)} onDelete={()=>deleteTask(task)}/>)}
        {dateTasks.length===0&&<div className="py-7 text-center space-y-1"><CalendarDays className="w-8 h-8 mx-auto text-[#B8AE9E]"/><p className="font-bold text-[#1B3A57]">No tasks scheduled</p><p className="text-xs text-[#8C8271]">Add a task for this date.</p></div>}
      </div>
    </section>

    {editing&&<div className="fixed inset-0 z-[60] bg-[#252522]/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={()=>setEditing(null)}>
      <form onSubmit={e=>{e.preventDefault();saveTask();}} onClick={e=>e.stopPropagation()} className="w-full max-w-sm max-h-[88dvh] overflow-y-auto bg-[#FCFAF6] rounded-2xl p-5 shadow-xl border border-[#DDD6C8] space-y-3 text-[#1B3A57]">
        <div className="flex items-center justify-between"><h3 className="text-base font-bold text-[#252522] font-serif-heading">{store.tasks.some(t=>t.id===editing.id)?'Edit Task':'Add Task'}</h3><button type="button" onClick={()=>setEditing(null)} className="text-[#9B1B30]"><X className="w-5 h-5"/></button></div>
        <Field label="Task title *"><input required autoFocus maxLength={100} value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} placeholder="e.g. Complete Assignment 1" className="work-input"/></Field>
        <div className="grid grid-cols-2 gap-2"><Field label="Date *"><input required type="date" value={editing.date} onChange={e=>setEditing({...editing,date:e.target.value})} className="work-input"/></Field><Field label="Time (optional)"><input type="time" value={editing.time} onChange={e=>setEditing({...editing,time:e.target.value})} className="work-input"/></Field></div>
        <Field label="Priority"><div className="grid grid-cols-3 gap-2">{(['Low','Medium','High'] as WorkPriority[]).map(p=><button type="button" key={p} onClick={()=>setEditing({...editing,priority:p})} className={`py-2.5 rounded-xl border text-xs font-bold transition-colors ${editing.priority===p?priorityStyle[p]:'bg-white border-[#DDD6C8] text-[#5A5347]'}`}>{p}</button>)}</div></Field>
        <div className="border-t border-[#EAE2D2] pt-3 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm"><Bell className="w-4 h-4 text-[#9B1B30]"/> Reminders</div>
          <label className="flex items-center justify-between text-xs"><span>Enable reminders</span><input type="checkbox" checked={editing.remindersEnabled} onChange={e=>setEditing({...editing,remindersEnabled:e.target.checked})}/></label>
          {editing.remindersEnabled&&<>
            <div className="flex flex-wrap gap-1.5">{editing.reminderOffsets.map((v,i)=><span key={`${v}-${i}`} className="bg-white border border-[#DDD6C8] rounded-full px-2 py-1 text-[10px]">{v>=1440?`${v/1440} day(s) before`:v>=60?`${v/60} hour(s) before`:`${v} min before`}<button type="button" onClick={()=>setEditing({...editing,reminderOffsets:editing.reminderOffsets.filter((_,j)=>j!==i)})} className="ml-1 text-[#9B1B30]">×</button></span>)}</div>
            <div className="grid grid-cols-[1fr_auto] gap-2"><select value={reminderPreset} onChange={e=>setReminderPreset(e.target.value)} className="work-input text-xs"><option value="30">30 minutes before</option><option value="60">1 hour before</option><option value="120">2 hours before</option><option value="1440">1 day before</option><option value="4320">3 days before</option></select><button type="button" onClick={addReminder} className="px-3 bg-[#1B3A57] text-white rounded-xl text-xs font-bold">Add</button></div>
            <label className="flex items-center justify-between text-xs"><span className="flex items-center gap-2"><Bell className="w-3.5 h-3.5"/> Alarm sound</span><input type="checkbox" checked={editing.alarmEnabled} onChange={e=>setEditing({...editing,alarmEnabled:e.target.checked})}/></label>
          </>}
        </div>
        <div className="flex gap-2 pt-1"><button type="button" onClick={()=>setEditing(null)} className="flex-1 py-2.5 rounded-xl border border-[#DDD6C8] font-bold text-sm">Cancel</button><button type="submit" className="flex-1 py-2.5 rounded-xl bg-[#9B1B30] text-white font-bold text-sm">Save Task</button></div>
      </form>
    </div>}
  </div>;
};

const Field: React.FC<{label:string;children:React.ReactNode}> = ({label,children}) => <label className="block space-y-1"><span className="block text-xs font-bold text-[#5A5347]">{label}</span>{children}</label>;
const TaskRow: React.FC<{task:WorkTask;onDone:()=>void;onEdit:()=>void;onDelete:()=>void}> = ({task,onDone,onEdit,onDelete}) => <div
  onClick={onDone}
  role="button"
  tabIndex={0}
  onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onDone();}}}
  className={`flex items-center justify-between gap-2 p-1.5 rounded-lg transition-all cursor-pointer min-h-[42px] ${task.completed?'bg-[#F5E4E7]':'hover:bg-[#EEF2F6]'}`}
>
  <div className="flex items-center gap-2.5 min-w-0 flex-1">
    <div className="shrink-0"><HandwrittenCheckbox checked={task.completed} onChange={onDone} color="sage" size="sm"/></div>
    <div className="min-w-0 flex-1">
      <span className={`block text-sm sm:text-base font-bold leading-tight truncate ${task.completed?'text-[#9B1B30] line-through decoration-[#9B1B30]':'text-[#1B3A57]'}`}>{task.title}</span>
      <span className="flex items-center gap-2 text-[11px] sm:text-xs text-[#64748B] leading-tight mt-0.5">
        {task.time ? <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 shrink-0"/>{task.time}</span> : null}
        <span aria-label={`${task.priority} priority`} title={`${task.priority} priority`} className={`inline-block w-2.5 h-2.5 rounded-[2px] border ${task.priority==='Low'?'bg-[#5C9B69] border-[#477E53]':task.priority==='Medium'?'bg-[#E6BD45] border-[#C59B2C]':'bg-[#C84B55] border-[#A93440]'}`}/>
        {task.remindersEnabled && <span aria-label="Reminder enabled" title="Reminder enabled" className="inline-block w-2 h-2 rounded-full bg-[#C3263D]"/>}
      </span>
    </div>
  </div>
  <div className="flex items-center gap-2 shrink-0">
    <button type="button" onClick={e=>{e.stopPropagation();onEdit();}} aria-label="Edit task" className="p-1 text-[#9B1B30]"><Pencil className="w-4 h-4"/></button>
    <button type="button" onClick={e=>{e.stopPropagation();onDelete();}} aria-label="Delete task" className="p-1 text-[#9B1B30]"><Trash2 className="w-4 h-4"/></button>
  </div>
</div>;


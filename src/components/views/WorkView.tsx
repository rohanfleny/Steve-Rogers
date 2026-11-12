import React, { useMemo, useRef, useState } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, RotateCcw, Plus, Pencil, Trash2,
  CheckCircle2, Circle, Bell, BellOff, BookOpen, Trophy, Laptop, User, Users,
  Briefcase, Clock, X, Settings2, Repeat2, ListChecks,
} from 'lucide-react';
import { WorkCategory, WorkPriority, WorkRepeat, WorkStore, WorkTask } from '../../types/work';
import { shiftDate, getTodayDateString } from '../../logic/calculations';

interface Props { store: WorkStore; onChange: (next: WorkStore) => void; }
const iconMap: Record<string, React.ElementType> = { book: BookOpen, trophy: Trophy, laptop: Laptop, user: User, users: Users, work: Briefcase };
const newId = () => `work-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const emptyTask = (date: string, categoryId: string): WorkTask => ({
  id: newId(), title: '', description: '', date, time: '', categoryId, priority: 'Medium',
  completed: false, remindersEnabled: false, reminderOffsets: [1440], alarmEnabled: true,
  repeat: 'none', repeatUntil: '', notes: '', createdAt: new Date().toISOString(),
});
const fmtDate = (date: string) => { const [y,m,d] = date.split('-').map(Number); return new Date(y,m-1,d).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); };

export const WorkView: React.FC<Props> = ({ store, onChange }) => {
  const today = getTodayDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [editing, setEditing] = useState<WorkTask | null>(null);
  const [categoryManager, setCategoryManager] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [showReminders, setShowReminders] = useState(false);
  const [reminderCustom, setReminderCustom] = useState('');

  const dateInputRef = useRef<HTMLInputElement>(null);
  const isToday = selectedDate === today;
  const [year, month, day] = selectedDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const weekdayShort = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const monthShort = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const dayOfWeek = dateObj.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDateStr = shiftDate(selectedDate, diffToMonday);
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const dateStr = shiftDate(mondayDateStr, offset);
    const [y, m, d] = dateStr.split('-').map(Number);
    const dObj = new Date(y, m - 1, d);
    return {
      dateStr,
      dayName: dObj.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: dObj.getDate(),
      isSelected: dateStr === selectedDate,
      isDayToday: dateStr === today,
      hasTasks: store.tasks.some(task => task.date === dateStr),
    };
  });
  const handleOpenDatePicker = () => {
    try {
      if (dateInputRef.current && 'showPicker' in dateInputRef.current) dateInputRef.current.showPicker();
      else { dateInputRef.current?.focus(); dateInputRef.current?.click(); }
    } catch {
      dateInputRef.current?.focus();
      dateInputRef.current?.click();
    }
  };
  const dateTasks = useMemo(() => store.tasks.filter(t => t.date === selectedDate), [store.tasks, selectedDate]);
  const groups = store.categories.map(c => ({category:c,tasks:dateTasks.filter(t=>t.categoryId===c.id)})).filter(g=>g.tasks.length>0);
  const uncategorized = dateTasks.filter(t=>!store.categories.some(c=>c.id===t.categoryId));

  const saveTask = () => {
    if (!editing || !editing.title.trim()) return;
    const exists = store.tasks.some(t=>t.id===editing.id);
    onChange({...store,tasks: exists ? store.tasks.map(t=>t.id===editing.id?editing:t) : [...store.tasks,editing]});
    setEditing(null); setShowReminders(false);
  };
  const toggleDone = (task: WorkTask) => {
    const completing = !task.completed;
    let nextTasks = store.tasks.map(t=>t.id===task.id?{...t,completed:completing,completedAt:completing?new Date().toISOString():undefined}:t);
    // Completing a repeating task closes this occurrence and creates the next one.
    if (completing && task.repeat !== 'none') {
      const base = new Date(`${task.date}T12:00:00`);
      if (task.repeat === 'daily') base.setDate(base.getDate()+1);
      if (task.repeat === 'every2days') base.setDate(base.getDate()+2);
      if (task.repeat === 'weekly') base.setDate(base.getDate()+7);
      if (task.repeat === 'monthly') base.setMonth(base.getMonth()+1);
      const nextDate = `${base.getFullYear()}-${String(base.getMonth()+1).padStart(2,'0')}-${String(base.getDate()).padStart(2,'0')}`;
      if (!task.repeatUntil || nextDate <= task.repeatUntil) {
        nextTasks = [...nextTasks,{...task,id:newId(),date:nextDate,completed:false,completedAt:undefined,createdAt:new Date().toISOString()}];
      }
    }
    onChange({...store,tasks:nextTasks});
  };
  const deleteTask = (task: WorkTask) => { if (window.confirm(`Delete "${task.title}"?`)) onChange({...store,tasks:store.tasks.filter(t=>t.id!==task.id)}); };
  const addCategory = () => { const name=newCategory.trim(); if(!name) return; if(store.categories.some(c=>c.name.toLowerCase()===name.toLowerCase())) { alert('This category already exists.'); return; } onChange({...store,categories:[...store.categories,{id:newId(),name,icon:'work'}]}); setNewCategory(''); };
  const removeCategory = (cat: WorkCategory) => { if(!window.confirm(`Delete category ${cat.name}? Its tasks will move to Uncategorized.`)) return; onChange({...store,categories:store.categories.filter(c=>c.id!==cat.id),tasks:store.tasks.map(t=>t.categoryId===cat.id?{...t,categoryId:''}:t)}); };
  const addReminder = () => { const mins=Number(reminderCustom); if(!mins || mins<1) return; setEditing(e=>e?{...e,remindersEnabled:true,reminderOffsets:[...e.reminderOffsets,mins]}:e); setReminderCustom(''); };

  return <div className="space-y-3 font-handwriting text-[#1B3A57]" id="work-dashboard">
    <div
      id="work-date-window-container"
      className="bg-[#FAF7F0] border border-[#E5DDD0] rounded-xl p-2 sm:p-2.5 shadow-sm space-y-1.5 select-none text-[#1B3A57]"
    >
      <div className="flex items-center justify-between gap-1.5">
        <button type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
          className="p-1.5 rounded-lg text-[#9B1B30] hover:text-[#761523] hover:bg-[#F5E4E7] transition-colors cursor-pointer shrink-0"
          aria-label="Previous Day">
          <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
        </button>
        <div className="flex-1 flex items-center justify-center gap-1 min-w-0">
          <button type="button" id="work-date-picker-trigger" onClick={handleOpenDatePicker}
            title="Click to select date"
            className="group flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg border border-[#D6DCE8] hover:border-[#9B1B30] bg-[#F1ECE1] hover:bg-[#F5E4E7] transition-all cursor-pointer shadow-xs min-w-0">
            <CalendarDays className="w-3.5 h-3.5 text-[#9B1B30] shrink-0" />
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-[#1B3A57] text-white">{weekdayShort}</span>
              <span className="text-xs sm:text-sm font-bold text-[#1B3A57] truncate">{day} {monthShort} {year}</span>
            </div>
          </button>
          <input ref={dateInputRef} type="date" value={selectedDate}
            onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }}
            className="sr-only" aria-hidden="true" tabIndex={-1} />
          {isToday ? (
            <span className="text-[9px] font-bold text-white bg-[#9B1B30] border border-[#9B1B30] px-2 py-0.5 rounded-full shrink-0">Today</span>
          ) : (
            <button type="button" onClick={() => setSelectedDate(today)} title="Jump to today"
              className="flex items-center gap-1 text-[9px] font-bold text-[#1B3A57] bg-[#F1ECE1] hover:bg-[#E8E1D4] border border-[#D6DCE8] px-2 py-0.5 rounded-full transition-all cursor-pointer shrink-0">
              <RotateCcw className="w-2.5 h-2.5 text-[#9B1B30]" /><span>Today</span>
            </button>
          )}
        </div>
        <button type="button" onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
          className="p-1.5 rounded-lg text-[#9B1B30] hover:text-[#761523] hover:bg-[#F5E4E7] transition-colors cursor-pointer shrink-0"
          aria-label="Next Day">
          <ChevronRight className="w-4 h-4 stroke-[2.2]" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 pt-1 border-t border-[#E5DDD0]">
        {weekDays.map((item) => (
          <button key={item.dateStr} type="button" onClick={() => setSelectedDate(item.dateStr)}
            className={`flex flex-col items-center justify-center py-1 sm:py-1.5 rounded-lg transition-all cursor-pointer relative ${
              item.isSelected ? 'bg-[#1B3A57] text-white shadow-md font-bold scale-[1.01]'
              : item.isDayToday ? 'bg-[#F5E4E7] text-[#9B1B30] font-bold border border-[#E1B9C0] hover:bg-[#F0DCE0]'
              : 'hover:bg-[#EFE9DF] text-[#78716C]'
            }`}>
            <span className={`text-[8px] sm:text-[9px] uppercase tracking-wider ${
              item.isSelected ? 'text-white/80 font-semibold' : item.isDayToday ? 'text-[#9B1B30]' : 'text-[#78716C]'
            }`}>{item.dayName.slice(0, 3)}</span>
            <span className={`text-xs sm:text-sm font-mono font-bold leading-tight ${
              item.isSelected ? 'text-white' : item.isDayToday ? 'text-[#9B1B30]' : 'text-[#1B3A57]'
            }`}>{item.dayNum}</span>
            <div className="flex items-center gap-0.5 mt-0 h-1">
              {item.hasTasks ? <span className={`w-1 h-1 rounded-full ${item.isSelected ? 'bg-white' : 'bg-[#9B1B30]'}`} /> : null}
            </div>
          </button>
        ))}
      </div>
    </div>

    <section className="bg-[#FCFAF6] rounded-2xl border border-[#DDD6C8] shadow-sm overflow-hidden">
      <div className="bg-[#1B3A57] px-4 py-3 flex items-center justify-between gap-2"><h2 className="text-base font-bold text-white uppercase tracking-wide">Tasks</h2><button type="button" onClick={()=>setEditing(emptyTask(selectedDate,store.categories[0]?.id||''))} className="inline-flex items-center gap-1.5 text-sm font-bold text-white hover:text-[#F5E4E7]"><Plus className="w-4 h-4"/> Add Task</button></div>
      <div className="p-3 space-y-4">
        {groups.map(({category,tasks})=>{const Icon=iconMap[category.icon]||Briefcase;return <div key={category.id} className="space-y-2"><div className="flex items-center justify-between border-b border-[#EAE2D2] pb-1"><div className="flex items-center gap-2 font-bold text-[#1B3A57]"><Icon className="w-4 h-4 text-[#9B1B30]"/>{category.name}</div><span className="text-[10px] text-[#8C8271]">{tasks.length} tasks</span></div>{tasks.map(task=><TaskRow key={task.id} task={task} onDone={()=>toggleDone(task)} onEdit={()=>setEditing(task)} onDelete={()=>deleteTask(task)} categoryName={category.name}/>)}</div>;})}
        {uncategorized.length>0&&<div className="space-y-2"><div className="font-bold border-b border-[#EAE2D2] pb-1">Uncategorized</div>{uncategorized.map(task=><TaskRow key={task.id} task={task} onDone={()=>toggleDone(task)} onEdit={()=>setEditing(task)} onDelete={()=>deleteTask(task)} categoryName="Uncategorized"/>)}</div>}
        {dateTasks.length===0&&<div className="py-8 text-center space-y-2"><CalendarDays className="w-8 h-8 mx-auto text-[#B8AE9E]"/><p className="font-bold text-[#1B3A57]">No work scheduled</p><p className="text-xs text-[#8C8271]">Add your first task for this date.</p></div>}
      </div>
    </section>

    {editing&&<div className="fixed inset-0 z-[60] bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={()=>setEditing(null)}><form onSubmit={e=>{e.preventDefault();saveTask();}} onClick={e=>e.stopPropagation()} className="w-full max-w-lg max-h-[92dvh] overflow-y-auto bg-[#FCFAF6] rounded-t-2xl sm:rounded-2xl border border-[#DDD6C8] shadow-2xl text-[#1B3A57]">
      <div className="sticky top-0 bg-[#1B3A57] text-white px-4 py-3 flex items-center justify-between"><h3 className="font-bold text-lg">{store.tasks.some(t=>t.id===editing.id)?'Edit Work':'Add New Work'}</h3><button type="button" onClick={()=>setEditing(null)}><X className="w-5 h-5"/></button></div>
      <div className="p-4 space-y-3">
        <Field label="Work title *"><input required maxLength={100} value={editing.title} onChange={e=>setEditing({...editing,title:e.target.value})} placeholder="e.g. Complete Assignment 1" className="work-input"/></Field>
        <Field label="Description"><textarea rows={2} value={editing.description} onChange={e=>setEditing({...editing,description:e.target.value})} placeholder="Additional details..." className="work-input"/></Field>
        <div className="grid grid-cols-2 gap-3"><Field label="Work date *"><input required type="date" value={editing.date} onChange={e=>setEditing({...editing,date:e.target.value})} className="work-input"/></Field><Field label="Work time"><input type="time" value={editing.time} onChange={e=>setEditing({...editing,time:e.target.value})} className="work-input"/></Field></div>
        <Field label="Category"><div className="flex gap-2"><select value={editing.categoryId} onChange={e=>setEditing({...editing,categoryId:e.target.value})} className="work-input flex-1"><option value="">Uncategorized</option>{store.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><button type="button" onClick={()=>setCategoryManager(true)} className="px-3 rounded-xl border border-[#DDD6C8] text-[#9B1B30] text-xs">Manage</button></div></Field>
        <Field label="Priority"><div className="grid grid-cols-3 gap-2">{(['Low','Medium','High'] as WorkPriority[]).map(p=><button type="button" key={p} onClick={()=>setEditing({...editing,priority:p})} className={`py-2 rounded-lg border text-xs font-bold ${editing.priority===p?'bg-[#1B3A57] text-white border-[#1B3A57]':'bg-white border-[#DDD6C8]'}`}>{p}</button>)}</div></Field>
        <div className="border-t border-[#EAE2D2] pt-3 space-y-2"><button type="button" onClick={()=>setShowReminders(!showReminders)} className="w-full flex items-center justify-between font-bold"><span className="flex items-center gap-2"><Bell className="w-4 h-4 text-[#9B1B30]"/> Reminder settings</span><span className="text-xs text-[#9B1B30]">{showReminders?'Hide':'Configure'}</span></button>{showReminders&&<div className="space-y-3 bg-[#F7F2E8] rounded-xl p-3"><label className="flex items-center justify-between text-sm"><span>Enable reminders</span><input type="checkbox" checked={editing.remindersEnabled} onChange={e=>setEditing({...editing,remindersEnabled:e.target.checked})}/></label>{editing.remindersEnabled&&<><div className="flex flex-wrap gap-2">{editing.reminderOffsets.map((v,i)=><span key={`${v}-${i}`} className="bg-white border border-[#DDD6C8] rounded-full px-2.5 py-1 text-[11px]">{v>=1440?`${v/1440} day(s) before`:v>=60?`${v/60} hour(s) before`:`${v} min before`}<button type="button" onClick={()=>setEditing({...editing,reminderOffsets:editing.reminderOffsets.filter((_,j)=>j!==i)})} className="ml-1 text-[#9B1B30]">×</button></span>)}</div><div className="grid grid-cols-[1fr_auto] gap-2"><select id="work-reminder-preset" className="work-input" defaultValue="30" onChange={e=>setReminderCustom(e.target.value)}><option value="30">30 minutes before</option><option value="60">1 hour before</option><option value="120">2 hours before</option><option value="1440">1 day before</option><option value="4320">3 days before</option></select><button type="button" onClick={()=>{const el=document.getElementById('work-reminder-preset') as HTMLSelectElement|null;const v=Number(el?.value||30);setEditing({...editing,remindersEnabled:true,reminderOffsets:[...editing.reminderOffsets,v]});}} className="px-3 bg-[#1B3A57] text-white rounded-lg text-xs">Add</button></div><label className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><Bell className="w-4 h-4"/> Alarm sound</span><input type="checkbox" checked={editing.alarmEnabled} onChange={e=>setEditing({...editing,alarmEnabled:e.target.checked})}/></label><p className="text-[10px] text-[#776E62]">ON uses the app's default alarm sound; OFF keeps the reminder silent.</p></>}</div>}</div>
        <div className="border-t border-[#EAE2D2] pt-3 space-y-2"><label className="flex items-center gap-2 font-bold text-sm"><Repeat2 className="w-4 h-4 text-[#9B1B30]"/> Repeat task</label><select value={editing.repeat} onChange={e=>setEditing({...editing,repeat:e.target.value as WorkRepeat})} className="work-input"><option value="none">Does not repeat</option><option value="daily">Every day</option><option value="every2days">Every 2 days</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select>{editing.repeat!=='none'&&<Field label="Repeat until (optional)"><input type="date" min={editing.date} value={editing.repeatUntil} onChange={e=>setEditing({...editing,repeatUntil:e.target.value})} className="work-input"/></Field>}</div>
        <Field label="Additional notes"><textarea rows={2} value={editing.notes} onChange={e=>setEditing({...editing,notes:e.target.value})} placeholder="Optional notes..." className="work-input"/></Field>
        <div className="flex gap-2 pt-2"><button type="button" onClick={()=>setEditing(null)} className="flex-1 py-3 rounded-xl border border-[#DDD6C8] font-bold text-sm">Cancel</button><button type="submit" className="flex-1 py-3 rounded-xl bg-[#9B1B30] text-white font-bold text-sm">Save Work</button></div>
      </div></form></div>}

    {categoryManager&&<div className="fixed inset-0 z-[70] bg-black/55 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={()=>setCategoryManager(false)}><div onClick={e=>e.stopPropagation()} className="w-full max-w-md bg-[#FCFAF6] rounded-t-2xl sm:rounded-2xl p-4 space-y-3 max-h-[80dvh] overflow-y-auto"><div className="flex justify-between items-center"><h3 className="text-lg font-bold">Manage Categories</h3><button onClick={()=>setCategoryManager(false)}><X/></button></div><div className="flex gap-2"><input value={newCategory} onChange={e=>setNewCategory(e.target.value)} onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addCategory())} placeholder="New category name" className="work-input flex-1"/><button onClick={addCategory} className="bg-[#9B1B30] text-white px-4 rounded-xl text-sm font-bold">Add</button></div>{store.categories.map(c=>{const Icon=iconMap[c.icon]||Briefcase;return <div key={c.id} className="flex items-center gap-2 border-b border-[#EAE2D2] py-2"><Icon className="w-4 h-4 text-[#1B3A57]"/><span className="flex-1 text-sm font-semibold">{c.name}</span><button onClick={()=>{const next=prompt('Rename category',c.name);if(next?.trim())onChange({...store,categories:store.categories.map(x=>x.id===c.id?{...x,name:next.trim()}:x)});}} className="text-[#9B1B30]"><Pencil className="w-4 h-4"/></button><button onClick={()=>removeCategory(c)} className="text-[#9B1B30]"><Trash2 className="w-4 h-4"/></button></div>})}<button onClick={()=>setCategoryManager(false)} className="w-full py-2.5 rounded-xl bg-[#1B3A57] text-white font-bold">Done</button></div></div>}
  </div>;
};

const Field: React.FC<{label:string;children:React.ReactNode}> = ({label,children}) => <label className="block space-y-1"><span className="block text-xs font-bold text-[#5A5347]">{label}</span>{children}</label>;
const TaskRow: React.FC<{task:WorkTask;onDone:()=>void;onEdit:()=>void;onDelete:()=>void;categoryName:string}> = ({task,onDone,onEdit,onDelete}) => <div className={`flex items-center gap-2 p-2 rounded-xl border ${task.completed?'bg-[#F1ECE1]/60 border-[#EAE2D2]':'bg-[#FAF7F0] border-[#E5DDD0]'}`}><button onClick={onDone} aria-label="Toggle completion" className="shrink-0">{task.completed?<CheckCircle2 className="w-5 h-5 text-[#607C68]"/>:<Circle className="w-5 h-5 text-[#9B1B30]"/>}</button><button onClick={onEdit} className="flex-1 min-w-0 text-left"><span className={`block text-sm font-bold truncate ${task.completed?'line-through text-[#8C8271]':'text-[#1B3A57]'}`}>{task.title}</span><span className="flex items-center gap-2 text-[10px] text-[#8C8271]"><Clock className="w-3 h-3"/>{task.time||'No time set'} · {task.priority} priority {task.remindersEnabled?'· Reminder':''}</span></button><button onClick={onEdit} aria-label="Edit task" className="p-1 text-[#9B1B30]"><Pencil className="w-4 h-4"/></button><button onClick={onDelete} aria-label="Delete task" className="p-1 text-[#9B1B30]"><Trash2 className="w-4 h-4"/></button></div>;

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AddFamilyMemberModal({ open, onOpenChange, onAdd }:{ open:boolean, onOpenChange:(v:boolean)=>void, onAdd:(member:any)=>void }){
  const [name,setName] = useState('');
  const [relation,setRelation] = useState('');
  const [color,setColor] = useState('#f97316');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAdd = async ()=>{
    if(!name||!relation) return toast({ title: 'Missing fields', description: 'Please enter name and relation', variant: 'destructive' });
    setLoading(true);
    try {
      const payload = { name, relation, color };
      const res = await api.family.create(payload);
      // server returns { data: member }
      const member = res?.data || res;
      if (!member) throw new Error('No member returned from server');
      onAdd(member);
      setName(''); setRelation(''); setColor('#f97316');
      onOpenChange(false);
      toast({ title: 'Family member added', description: 'Saved to your account' });
    } catch (err) {
      console.error('Failed to add family member', err);
      toast({ title: 'Failed to add', description: err instanceof Error? err.message : String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="block mb-1 text-sm">Name</label>
            <Input value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm">Relation</label>
            <Input value={relation} onChange={(e)=>setRelation(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 text-sm">Card color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} />
              <div className="px-3 py-1 rounded" style={{background:color}}>{color}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={()=>onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={loading}>{loading? 'Adding...' : 'Add'}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

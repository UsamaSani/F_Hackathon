import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FamilyMemberCard({ member, onOpen, onEdit, onDelete }:{ member:any, onOpen:()=>void, onEdit?:()=>void, onDelete?:()=>void }){
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{background: member.color}}>
            <span className="text-white font-bold">{member.name.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex-1 ml-4">
          <h3 className="font-semibold">{member.name}</h3>
          <p className="text-sm text-muted-foreground">{member.relation}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>Delete</Button>
          <Button size="sm" className="gradient-primary" onClick={onOpen}>Open</Button>
        </div>
      </div>
    </Card>
  )
}

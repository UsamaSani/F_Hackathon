import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { fetchReports } from '@/lib/slices/reportSlice';
import { RootState, AppDispatch } from '@/lib/store';
import AddReportModal from '@/components/AddReportModal';

export default function FamilyProfile(){
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [query, setQuery] = useState('');
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const { items: reports, loading, error } = useSelector((state: RootState) => state.reports);

  useEffect(()=>{
    const stored = localStorage.getItem('family_members');
    if(stored){
      const arr = JSON.parse(stored);
      setMember(arr.find((x:any)=>x.id===id));
    }
  },[id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchReports(id));
    }
  }, [id, dispatch]);

  const data = [
    { name: 'Jan', value: 80 },
    { name: 'Feb', value: 76 },
    { name: 'Mar', value: 78 },
    { name: 'Apr', value: 82 },
    { name: 'May', value: 85 },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{member? member.name : 'Member'}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Edit</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="md:col-span-1 p-4">
          <h3 className="font-semibold mb-2">Vitals</h3>
          <div style={{height:200}}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="md:col-span-2 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Reports</h3>
            <div className="flex items-center gap-2">
              <Input placeholder="Search title/test/hospital" value={query} onChange={(e:any)=>setQuery(e.target.value)} />
              {id && <AddReportModal familyMemberId={id} />}
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Title</th>
                  <th className="p-2">Test</th>
                  <th className="p-2">Lab/Hospital</th>
                  <th className="p-2">Doctor</th>
                  <th className="p-2">Date</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Flag</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.filter(r=> {
                  if(!query) return true;
                  const q = query.toLowerCase();
                  return (r.title||'').toLowerCase().includes(q) || (r.test||'').toLowerCase().includes(q) || (r.hospital||'').toLowerCase().includes(q);
                }).map(r=> (
                  <tr key={r._id} className="border-t">
                    <td className="p-2">{r.title}</td>
                    <td className="p-2">{r.test}</td>
                    <td className="p-2">{r.hospital}</td>
                    <td className="p-2">{r.doctor}</td>
                    <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="p-2">{r.price}</td>
                    <td className="p-2">{r.flag? 'Yes': 'No'}</td>
                    <td className="p-2">
                      <Button size="sm" onClick={()=>{ alert('View report: ' + r._id) }}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

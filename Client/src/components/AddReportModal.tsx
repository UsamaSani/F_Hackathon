import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { uploadReport, fetchReports } from '@/lib/slices/reportSlice';
import { AppDispatch } from '@/lib/store';

interface AddReportModalProps {
  familyMemberId: string;
}

export default function AddReportModal({ familyMemberId }: AddReportModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    test: '',
    hospital: '',
    doctor: '',
    date: new Date().toISOString().split('T')[0],
    price: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        title: 'File required',
        description: 'Please select a PDF file to upload',
        variant: 'destructive',
      });
      return;
    }

    const form = new FormData();
    form.append('pdf', file);
    form.append('familyMemberId', familyMemberId);
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    setLoading(true);
    try {
      await dispatch(uploadReport({ form })).unwrap();
      await dispatch(fetchReports(familyMemberId));
      toast({
        title: 'Report uploaded successfully',
        description: 'The report has been added to the family member\'s records',
      });
      setOpen(false);
      setFormData({
        title: '',
        test: '',
        hospital: '',
        doctor: '',
        date: new Date().toISOString().split('T')[0],
        price: '',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Report</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test">Test</Label>
            <Input
              id="test"
              value={formData.test}
              onChange={(e) => setFormData({ ...formData, test: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hospital">Hospital/Lab</Label>
            <Input
              id="hospital"
              value={formData.hospital}
              onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Input
              id="doctor"
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">PDF File</Label>
            <Input
              id="file"
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Report'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
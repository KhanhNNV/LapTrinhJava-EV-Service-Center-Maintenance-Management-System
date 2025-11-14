import { Card, CardContent } from '@/components/ui/card';
import { History as HistoryIcon, CheckCircle } from 'lucide-react';

export default function History() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Lịch sử dịch vụ</h2>
        <p className="text-muted-foreground">
          Xem lịch sử bảo dưỡng và sửa chữa
        </p>
      </div>

      <Card className="shadow-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <HistoryIcon className="w-16 h-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có lịch sử</h3>
          <p className="text-muted-foreground">
            Lịch sử dịch vụ sẽ hiển thị tại đây sau khi hoàn thành
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

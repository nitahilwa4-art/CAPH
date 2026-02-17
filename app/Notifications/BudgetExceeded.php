<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BudgetExceeded extends Notification
{
    use Queueable;

    public function __construct(public $budget, public $transaction)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Peringatan Anggaran',
            'message' => "Pengeluaran untuk kategori '{$this->budget->category}' telah mencapai " . $this->budget->percentage . "% dari batas.",
            'type' => $this->budget->percentage >= 100 ? 'ALERT' : 'WARNING',
            'link' => route('budgets.index'),
        ];
    }
}

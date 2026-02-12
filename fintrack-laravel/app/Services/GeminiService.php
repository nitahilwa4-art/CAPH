<?php

namespace App\Services;

use App\Models\User;
use Gemini\Laravel\Facades\Gemini;
use Gemini\Data\GenerationConfig;
use Gemini\Enums\ModelType;
use Illuminate\Support\Collection;

class GeminiService
{
    /**
     * Parse natural language input into transaction array
     */
    public function parseNaturalLanguageTransaction(string $input): array
    {
        try {
            $today = now()->format('Y-m-d');
            
            $prompt = "Analisis teks berikut dan ekstrak data transaksi keuangan.
Teks: \"{$input}\"

Kembalikan array objek JSON dengan properti:
- description (string): Deskripsi singkat transaksi
- amount (number): Jumlah uang (dalam Rupiah/Angka murni tanpa simbol)
- type (string): 'INCOME' atau 'EXPENSE'
- category (string): Kategori yang paling relevan (Contoh: Makanan, Transportasi, Gaji, dll)
- date (string): Tanggal dalam format ISO (YYYY-MM-DD). Jika tidak disebutkan, gunakan tanggal hari ini: {$today}.";

            $result = Gemini::generativeModel(ModelType::GEMINI_PRO)
                ->withGenerationConfig(
                    new GenerationConfig(
                        responseMimeType: 'application/json'
                    )
                )
                ->generateContent($prompt);

            $text = $result->text();
            
            if (!$text) {
                return [];
            }

            return json_decode($text, true) ?? [];

        } catch (\Exception $e) {
            \Log::error('Gemini AI parsing error: ' . $e->getMessage());
            throw new \Exception('Gagal memproses input dengan AI. Silakan coba lagi.');
        }
    }

    /**
     * Get financial advice based on user profile and transactions
     */
    public function getFinancialAdvice(User $user, Collection $transactions): string
    {
        try {
            // Simplify data to save tokens
            $summary = $transactions->take(50)->map(function ($t) {
                return "{$t->date}: {$t->type} - {$t->category} - Rp" . number_format($t->amount, 0, ',', '.') . " ({$t->description})";
            })->join("\n");

            // Build Profile Context
            $profileContext = "";
            if ($user->financial_profile) {
                $fp = $user->financial_profile;
                $occupationMap = [
                    'STABLE' => 'PNS/BUMN (Stabil)',
                    'PRIVATE' => 'Karyawan Swasta',
                    'FREELANCE' => 'Freelancer/Pengusaha (Fluktuatif)'
                ];
                
                $maritalStatus = ($fp['maritalStatus'] ?? 'SINGLE') === 'MARRIED' ? 'Menikah' : 'Lajang';
                $dependents = $fp['dependents'] ?? 0;
                $occupation = $occupationMap[$fp['occupation'] ?? 'PRIVATE'] ?? 'Tidak diketahui';
                
                $goals = '';
                if (!empty($fp['goals'])) {
                    foreach ($fp['goals'] as $goal) {
                        $amount = number_format($goal['amount'] ?? 0, 0, ',', '.');
                        $goals .= "- {$goal['name']}: Target Rp{$amount} pada {$goal['deadline']}\n";
                    }
                } else {
                    $goals = 'Belum ada target spesifik.';
                }
                
                $profileContext = "
DATA PROFIL PENGGUNA:
- Status Pernikahan: {$maritalStatus}
- Jumlah Tanggungan: {$dependents} orang
- Pekerjaan: {$occupation}
- Target Finansial (Financial Goals):
{$goals}";
            }

            $prompt = "Bertindaklah sebagai penasihat keuangan pribadi (Financial Planner) yang sangat cerdas, empatik, dan strategis.

{$profileContext}

RIWAYAT TRANSAKSI TERAKHIR (50 item):
{$summary}

TUGAS ANDA:
Berikan analisis keuangan yang mendalam dalam Bahasa Indonesia yang profesional namun ramah. Gunakan format Markdown.

Poin-poin analisis yang WAJIB ada:
1. **Kesehatan Cachflow**: Analisis pemasukan vs pengeluaran berdasarkan data transaksi.
2. **Analisis Profil Risiko & Dana Darurat**: 
   - Berdasarkan pekerjaan pengguna, hitung berapa bulan Dana Darurat yang ideal.
   - Bandingkan dengan pola pengeluaran mereka saat ini.
3. **Kewajaran Pengeluaran**:
   - Apakah pengeluaran untuk kebutuhan pokok terlihat wajar?
4. **Gap Analysis Target Finansial**:
   - Untuk setiap 'Target Finansial', hitung berapa yang harus ditabung per bulan mulai sekarang hingga deadline.
   - Bandingkan angka tersebut dengan sisa uang (surplus) bulanan rata-rata user saat ini.
5. **3 Rekomendasi Konkret**: Langkah nyata untuk memperbaiki keuangan atau mencapai target.";

            $result = Gemini::generativeModel(ModelType::GEMINI_PRO)
                ->generateContent($prompt);

            return $result->text() ?? 'Maaf, saya tidak dapat menganalisis data saat ini.';

        } catch (\Exception $e) {
            \Log::error('Gemini AI advice error: ' . $e->getMessage());
            return 'Terjadi kesalahan saat menghubungkan ke AI. Silakan coba lagi nanti.';
        }
    }
}

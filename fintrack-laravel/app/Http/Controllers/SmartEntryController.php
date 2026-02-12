<?php

namespace App\Http\Controllers;

use App\Models\Wallet;
use App\Models\Category;
use App\Services\GeminiService;
use App\Services\TransactionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SmartEntryController extends Controller
{
    protected $geminiService;
    protected $transactionService;

    public function __construct(GeminiService $geminiService, TransactionService $transactionService)
    {
        $this->geminiService = $geminiService;
        $this->transactionService = $transactionService;
    }

    public function index(Request $request)
    {
        $wallets = Wallet::where('user_id', $request->user()->id)->get();
        $categories = Category::userCategories($request->user()->id)->get();
        
        return Inertia::render('SmartEntry/Index', [
            'wallets' => $wallets,
            'categories' => $categories,
        ]);
    }

    public function parse(Request $request)
    {
        $validated = $request->validate([
            'input' => 'required|string|min:5',
        ]);
        
        try {
            $parsedTransactions = $this->geminiService->parseNaturalLanguageTransaction($validated['input']);
            
            return response()->json([
                'success' => true,
                'transactions' => $parsedTransactions,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function confirm(Request $request)
    {
        $validated = $request->validate([
            'transactions' => 'required|array|min:1',
            'transactions.*.description' => 'required|string',
            'transactions.*.amount' => 'required|numeric|min:0',
            'transactions.*.type' => 'required|in:INCOME,EXPENSE',
            'transactions.*.category' => 'required|string',
            'transactions.*.date' => 'required|date',
            'wallet_id' => 'required|exists:wallets,id',
        ]);
        
        $this->transactionService->createTransactions(
            $validated['transactions'],
            $request->user()->id,
            $validated['wallet_id']
        );
        
        return redirect()->route('dashboard')->with('success', 'Transaksi AI berhasil disimpan!');
    }
}

<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Address;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AddressController extends Controller
{
    /**
     * List the customer's saved addresses.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Account/Addresses/Index', [
            'addresses' => $request->user()
                ->addresses()
                ->orderByDesc('is_default')
                ->orderByDesc('id')
                ->get()
                ->map(fn (Address $address): array => [
                    'id' => $address->id,
                    'label' => $address->label,
                    'first_name' => $address->first_name,
                    'last_name' => $address->last_name,
                    'company' => $address->company,
                    'address_line_1' => $address->address_line_1,
                    'address_line_2' => $address->address_line_2,
                    'city' => $address->city,
                    'state' => $address->state,
                    'postal_code' => $address->postal_code,
                    'country' => $address->country,
                    'phone' => $address->phone,
                    'is_default' => $address->is_default,
                    'one_liner' => $address->oneLiner(),
                ])->values(),
        ]);
    }

    /**
     * Store a new address.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $address = $request->user()->addresses()->create($validated);

        if ($validated['is_default'] ?? false) {
            $address->makeDefault();
        }

        return back()->with('success', 'Your address has been saved.');
    }

    /**
     * Update an existing address.
     */
    public function update(Request $request, Address $address): RedirectResponse
    {
        $this->authorizeAddress($request, $address);

        $validated = $request->validate($this->rules());

        $address->update($validated);

        if ($validated['is_default'] ?? false) {
            $address->makeDefault();
        }

        return back()->with('success', 'Your address has been updated.');
    }

    /**
     * Delete an address.
     */
    public function destroy(Request $request, Address $address): RedirectResponse
    {
        $this->authorizeAddress($request, $address);

        $address->delete();

        return back()->with('success', 'Your address has been removed.');
    }

    /**
     * Mark an address as the customer's default.
     */
    public function makeDefault(Request $request, Address $address): RedirectResponse
    {
        $this->authorizeAddress($request, $address);

        $address->makeDefault();

        return back()->with('success', 'Your default address has been updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'label' => ['nullable', 'string', 'max:50'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'address_line_1' => ['required', 'string', 'max:255'],
            'address_line_2' => ['nullable', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'country' => ['required', 'string', 'size:2'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_default' => ['boolean'],
        ];
    }

    private function authorizeAddress(Request $request, Address $address): void
    {
        abort_unless($address->user_id === $request->user()->id, 404);
    }
}

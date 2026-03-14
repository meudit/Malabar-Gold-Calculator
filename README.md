# Gold Calculator

A modern, minimalist web application for calculating and tracking gold investments. Input multiple gold items with varying weights and value additions (VA), factor in proportional discounts, and get a detailed itemized invoice alongside your full tax breakdown.

Features a dark/light theme toggle, flat SVG icons throughout, and a fully responsive mobile layout.

## Features

- **Dynamic Item Entry:** Add multiple gold items and automatically accumulate total weight.
- **Proportional Discount Logic:** Built-in calculation for base gold price vs. discounted weights on a per-item basis.
- **Itemized Invoice View:** A detailed tabular invoice breaking down each item's gold gram, average price, subtotal, applied VA, and grand total — with a net total, tax, and final price summary at the bottom.
- **"No Discount" Comparison View:** A toggleable panel showing what the equivalent purchase would cost at today's market price without any discounts applied, plus your total savings.
- **Flat SVG Icons:** Clean, consistent line icons for all interactive controls — theme toggle, add/remove item, calculate, and panel toggles.
- **Modern Theme:** Flat, angular minimalist design using `Google Sans` typography, complete with local-storage-backed Light/Dark modes.
- **Mobile Responsive Layout:** All tables scroll horizontally on small screens; font sizes and layouts adapt gracefully to narrow viewports.

## Usage

1. **Global Inputs**:
   - `Total Investment`: Base capital placed into the investment.
   - `Total Gold Accumulated`: Past gold accumulation against your investment (grams).
   - `Today's Gold Price`: Current daily market price per gram.
   - `Discount (%)`: The percentage discount parameter (e.g. `5` for 5%).
2. **Item Addition**: Click **+ Add Item** and enter the gram `Weight` and `VA (%)` for each piece. Use percentage values directly (e.g. `12` for 12% VA).
3. **Calculate Results**: Click **Calculate Results** to generate the summary breakdown below.
4. **View More Info**: Toggle the *View More Info* button to see the equivalent no-discount cost and your total savings.
5. **View Invoice**: Toggle the *View Invoice* button to see a detailed tabular breakdown per item, including subtotals, applied VA, grand totals, tax, and final payable.

## Installation

This is a vanilla HTML/CSS/JS frontend — no build tools or dependencies required.

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
3. (Optional) Host on GitHub Pages for a live, shareable web app.

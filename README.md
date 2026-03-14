# Gold Calculator

A simple, modern web application designed to help calculate and track gold investments. This tool allows users to input multiple gold items with varying weights and value additions (VA), factor in proportional discounts, and see exactly what their total invoice will be alongside any accumulated tax. 

The application features a sleek dark-and-light theme switch and mobile-responsive layout for checking real-time totals anywhere.

## Features

- **Dynamic Item Entry:** Add multiple gold items and automatically view the accumulated weight.
- **Proportional Discount Logic:** Built-in calculation matching your specific parameters for base gold price vs discounted weights.
- **"No Discount" Comparison View:** A toggleable info breakdown comparing your final paid amount out-the-door vs what the total value would be if bought without accumulated or proportional discounts.
- **Modern Theme:** Clean, flat, and angular minimalist design utilizing the `Archia` font family to match a unified aesthetic, complete with local-storage-backed Light/Dark modes.
- **Mobile Responsive Layout:** Tables explicitly styled to never scroll horizontally off-screen, maintaining clean presentation on any device.

## Usage

1. **Global Inputs**:
   - `Total Investment`: Base capital placed into the investment.
   - `Total Gold Accumulated`: Past accumulation against your investment.
   - `Today's Gold Price`: Current daily market price per gram.
   - `Discount (%)`: The percentage discount proportion parameter (e.g. 5 for 5%).
2. **Item Addition**: Input the gram `Weight` and the applied `VA (%)` on an item-by-item basis. Ensure percentage variables exactly reflect the desired number rate (e.g. 12 for 12% VA).
3. **Calculate Results**: Click the primary Calculate button to append the breakdown table below it.
4. **Compare Costs**: Toggle the *View More Info* button beneath your results table to see identical metrics measured without your discounts or accumulated price brackets applied. 

## Installation

This is a vanilla HTML/CSS/JS frontend application requiring no backend routing or module bundler installation.

1. Clone or download this repository.
2. Open `index.html` in any modern web browser.
3. (Optional) Re-host the files on Github Pages to run it as a live web application anywhere.

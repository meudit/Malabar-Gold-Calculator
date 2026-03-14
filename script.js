document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('items_container');
    const addItemBtn = document.getElementById('add_item_btn');
    const calculateBtn = document.getElementById('calculate_btn');
    const resultsSection = document.getElementById('results_section');
    const viewMoreBtn = document.getElementById('view_more_btn');
    const noDiscountSection = document.getElementById('no_discount_section');
    const themeToggleBtn = document.getElementById('theme_toggle_btn');
    const themeIcon = document.getElementById('theme_icon');
    const viewInvoiceBtn = document.getElementById('view_invoice_btn');
    const invoiceSection = document.getElementById('invoice_section');
    const invoiceTbody = document.getElementById('invoice_tbody');

    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    const xIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

    // Theme logic - default to dark if not set, else follow localstorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.innerHTML = savedTheme === 'dark' ? sunIcon : moonIcon;

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeIcon.innerHTML = newTheme === 'dark' ? sunIcon : moonIcon;
        localStorage.setItem('theme', newTheme);
    });

    let itemCount = 0;

    function createItemRow() {
        itemCount++;
        const row = document.createElement('div');
        row.className = 'item-row';
        row.id = `item_row_${itemCount}`;

        row.innerHTML = `
            <div class="input-group">
                <label for="wt_${itemCount}">Weight</label>
                <input type="number" id="wt_${itemCount}" class="item-wt" step="0.01" placeholder="e.g. 10.5">
            </div>
            <div class="input-group">
                <label for="va_${itemCount}">VA (%)</label>
                <input type="number" id="va_${itemCount}" class="item-va" step="0.01" placeholder="e.g. 12">
            </div>
            <button class="btn-icon" onclick="removeItem('${row.id}')" aria-label="Remove item">${xIcon}</button>
        `;
        itemsContainer.appendChild(row);
    }

    // Attach to window so onclick can find it
    window.removeItem = function(rowId) {
        const row = document.getElementById(rowId);
        if (row) {
            row.remove();
        }
    }

    // Initialize with 1 item row
    createItemRow();

    addItemBtn.addEventListener('click', createItemRow);

    calculateBtn.addEventListener('click', () => {
        // Fetch global inputs
        const tot_investment = parseFloat(document.getElementById('tot_investment').value) || 0;
        const gold_accumulated = parseFloat(document.getElementById('gold_accumulated').value) || 0;
        const gold_price = parseFloat(document.getElementById('gold_price').value) || 0;
        // Divide percentage by 100 for actual math
        const dis = (parseFloat(document.getElementById('dis').value) || 0) / 100;

        // Calculate Average Price
        let avg_price = 0;
        if (gold_accumulated > 0) {
            avg_price = Math.round((tot_investment / gold_accumulated) * 100) / 100;
        }

        let cum = 0;
        let gold_rate = 0;
        let discon = 0;
        let va_total = 0;

        // "No Discount" hypothetical tracking variables
        let nd_gold_value = 0;
        let nd_va_total = 0;

        // Invoice tracking array
        const invoiceItems = [];

        // Fetch all item rows
        const itemRows = document.querySelectorAll('.item-row');
        itemRows.forEach((row) => {
            const wtInput = row.querySelector('.item-wt');
            const vaInput = row.querySelector('.item-va');
            
            const wt = parseFloat(wtInput.value) || 0;
            // Divide percentage by 100 for actual math
            const va = (parseFloat(vaInput.value) || 0) / 100;

            cum += wt;

            let avg_rate = 0;
            if (cum <= gold_accumulated) {
                avg_rate = avg_price;
            } else {
                if (wt > 0) {
                    avg_rate = Math.round(((wt - (cum - gold_accumulated)) * avg_price + ((cum - gold_accumulated) * gold_price)) / wt * 100) / 100;
                }
            }

            const tot_gold_rate = wt * avg_rate;
            const va_inr = va * gold_price * wt;

            let discount = 0;
            if (cum > gold_accumulated) {
                // Exactly transcribing max and min math matching the python code provided.
                const wt_diff = Math.max((wt - (cum - gold_accumulated)), 0);
                discount = wt_diff * gold_price * Math.min(dis, va);
            } else {
                discount = wt * gold_price * Math.min(dis, va);
            }

            gold_rate += tot_gold_rate;
            discon += discount;
            va_total += va_inr;

            // Compute hypothetical "no discount" totals
            nd_gold_value += (wt * gold_price);
            nd_va_total += (wt * gold_price * va); // full VA paid fully at today's price

            // Store invoice info for this row
            invoiceItems.push({
                wt: wt,
                avg_rate: avg_rate,
                subtotal: tot_gold_rate,
                applied_va: va_inr,
                grand_total: tot_gold_rate + va_inr
            });
        });

        // Current adjusted calculation
        const tot_invoice = gold_rate + va_total;
        const with_tax = tot_invoice * 1.03;
        const adjust = tot_investment + discon;
        const tot_amt = with_tax - adjust;

        // Hypothetical calculation
        const nd_subtotal = nd_gold_value + nd_va_total;
        const nd_tax = nd_subtotal * 0.03;
        const nd_total = nd_subtotal + nd_tax;
        const nd_savings = nd_total - (tot_investment + tot_amt);

        // Display results
        const formatNum = (val) => Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Render invoice table rows
        invoiceTbody.innerHTML = '';
        let inv_net_total = 0;

        invoiceItems.forEach((item, index) => {
            inv_net_total += item.grand_total;
            const rowHTML = `
                <tr>
                    <td>Item ${index + 1}</td>
                    <td class="value" style="font-size:1rem">${item.wt.toFixed(2)} g</td>
                    <td class="value" style="font-size:1rem">₹${formatNum(item.avg_rate)}</td>
                    <td class="value" style="font-size:1rem">₹${formatNum(item.subtotal)}</td>
                    <td class="value" style="font-size:1rem">₹${formatNum(item.applied_va)}</td>
                    <td class="value" style="font-size:1rem">₹${formatNum(item.grand_total)}</td>
                </tr>
            `;
            invoiceTbody.insertAdjacentHTML('beforeend', rowHTML);
        });

        const inv_tax = inv_net_total * 0.03;
        const inv_final_price = inv_net_total + inv_tax;

        document.getElementById('inv_net_total').textContent = formatNum(inv_net_total);
        document.getElementById('inv_tax').textContent = formatNum(inv_tax);
        document.getElementById('inv_final_price').textContent = formatNum(inv_final_price);

        document.getElementById('res_avg_price').textContent = formatNum(avg_price);
        document.getElementById('res_tot_gold_rate').textContent = formatNum(gold_rate);
        document.getElementById('res_tot_va').textContent = formatNum(va_total);
        document.getElementById('res_tot_invoice').textContent = formatNum(tot_invoice);
        document.getElementById('res_with_tax').textContent = formatNum(with_tax);
        document.getElementById('res_adjust').textContent = formatNum(adjust);
        document.getElementById('res_tot_amt').textContent = formatNum(tot_amt);

        // Display "No Discount" hypothetical results
        document.getElementById('nd_gold_value').textContent = formatNum(nd_gold_value);
        document.getElementById('nd_va').textContent = formatNum(nd_va_total);
        document.getElementById('nd_subtotal').textContent = formatNum(nd_subtotal);
        document.getElementById('nd_tax').textContent = formatNum(nd_tax);
        document.getElementById('nd_total').textContent = formatNum(nd_total);
        document.getElementById('nd_savings').textContent = formatNum(nd_savings);

        // Show section and scroll into view smoothly
        resultsSection.style.display = 'block';
        noDiscountSection.style.display = 'none'; // reset just in case
        invoiceSection.style.display = 'none'; // reset just in case
        viewMoreBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg> View More Info (No Discount scenario)';
        viewInvoiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> View Invoice';
        
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    viewMoreBtn.addEventListener('click', () => {
        if (noDiscountSection.style.display === 'none') {
            noDiscountSection.style.display = 'block';
            viewMoreBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg> Hide Info';
            noDiscountSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            noDiscountSection.style.display = 'none';
            viewMoreBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg> View More Info (No Discount scenario)';
        }
    });

    viewInvoiceBtn.addEventListener('click', () => {
        if (invoiceSection.style.display === 'none') {
            invoiceSection.style.display = 'block';
            viewInvoiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> Hide Invoice';
            invoiceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            invoiceSection.style.display = 'none';
            viewInvoiceBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> View Invoice';
        }
    });
});

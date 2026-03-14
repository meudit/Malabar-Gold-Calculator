document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('items_container');
    const addItemBtn = document.getElementById('add_item_btn');
    const calculateBtn = document.getElementById('calculate_btn');
    const resultsSection = document.getElementById('results_section');
    const viewMoreBtn = document.getElementById('view_more_btn');
    const noDiscountSection = document.getElementById('no_discount_section');
    const themeToggleBtn = document.getElementById('theme_toggle_btn');
    const themeIcon = document.getElementById('theme_icon');

    // Theme logic - default to dark if not set, else follow localstorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
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
            <button class="btn-icon" onclick="removeItem('${row.id}')" aria-label="Remove item">✕</button>
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
        viewMoreBtn.textContent = 'View More Info (No Discount scenario)';
        
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    viewMoreBtn.addEventListener('click', () => {
        if (noDiscountSection.style.display === 'none') {
            noDiscountSection.style.display = 'block';
            viewMoreBtn.textContent = 'Hide Info';
            noDiscountSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            noDiscountSection.style.display = 'none';
            viewMoreBtn.textContent = 'View More Info (No Discount scenario)';
        }
    });
});

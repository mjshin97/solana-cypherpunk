use anchor_lang::prelude::*;

declare_id!("61VvCX1CSBg24fg28vBgmeW7QmYgMMeCaFBWyHRaZ5zT");

#[program]
pub mod rwa_invoice {
    use super::*;
    pub fn create_invoice(ctx: Context<CreateInvoice>, bus_id: String, date: String, passengers: u32, revenue: u64) -> Result<()> {      // <- 여기 수정
        let invoice = &mut ctx.accounts.invoice;
        invoice.bus_id = bus_id;
        invoice.date = date;
        invoice.passengers = passengers;
        invoice.revenue = revenue;
        Ok(())
    }
}

#[account]
pub struct Invoice {
    pub bus_id: String,
    pub date: String,
    pub passengers: u32,
    pub revenue: u64,
    pub items: Vec<InvoiceItem>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InvoiceItem {
    pub description: String,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct CreateInvoice<'info> {
    #[account(init, payer = user, space = 9000)]
    pub invoice: Account<'info, Invoice>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

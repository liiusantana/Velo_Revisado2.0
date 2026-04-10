import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
    console.log("Iniciando o browser (modo visível)...");
    // headless: false e slowMo para que você possa ver a interação acontecendo na sua tela
    const browser = await chromium.launch({ headless: false, slowMo: 500 });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();
    const evidencesDir = 'c:/automatizai/velo/docs/tests/evidencias';

    if (!fs.existsSync(evidencesDir)) {
        fs.mkdirSync(evidencesDir, { recursive: true });
    }

    const waitForPrice = async (expectedPrice) => {
        await page.waitForFunction((price) => {
            const el = document.querySelector('[data-testid="total-price"]');
            return el && el.textContent.includes(price);
        }, expectedPrice, { timeout: 10000 });
    };

    try {
        console.log("Navegando para o Configurador http://localhost:5173/configure ...")
        await page.goto('http://localhost:5173/configure');
        await page.waitForLoadState('domcontentloaded');

        console.log("Passo 1: Visualizar o preço inicial (40.000,00)...");
        await waitForPrice('40.000,00');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(evidencesDir, 'CT02_Passo1.png') });

        console.log("Passo 2: Selecionar as Rodas 'Sport' (42.000,00)...");
        await page.click('[data-testid="wheel-option-sport"]');
        await waitForPrice('42.000,00');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(evidencesDir, 'CT02_Passo2.png') });

        console.log("Passo 3: Adicionar o opcional 'Precision Park' (47.500,00)...");
        await page.click('[data-testid="opt-precision-park"]');
        await waitForPrice('47.500,00');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(evidencesDir, 'CT02_Passo3.png') });

        console.log("Passo 4: Adicionar o opcional 'Flux Capacitor' (52.500,00)...");
        await page.click('[data-testid="opt-flux-capacitor"]');
        await waitForPrice('52.500,00');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(evidencesDir, 'CT02_Passo4.png') });

        console.log("Passo 5: Desmarcar as Rodas 'Sport' selecionando Aero (50.500,00)...");
        await page.click('[data-testid="wheel-option-aero"]');
        await waitForPrice('50.500,00');
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(evidencesDir, 'CT02_Passo5.png') });

        console.log("Todos os passos foram concluídos com sucesso! Evidências salvas em PNG.");
        await page.waitForTimeout(1000); // pequeno delay final para o usuário ver antes de fechar
    } catch (e) {
        console.error("Falha na execução do teste:", e);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();

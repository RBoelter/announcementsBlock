describe('Announcements Block plugin tests', function () {

	it('Disable Announcements Block', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.get('nav[class="app__nav"] a:contains("Website")').click();
		cy.get('button[id="plugins-button"]').click();
		// disable plugin if enabled
		cy.get('input[id^="select-cell-announcementsblockplugin-enabled"]')
			.then($btn => {
				if ($btn.attr('checked') === 'checked') {
					cy.get('input[id^="select-cell-announcementsblockplugin-enabled"]').click();
					cy.get('div[class*="pkp_modal_panel"] button[class*="pkpModalConfirmButton"]').click();
					cy.get('div:contains(\'The plugin "Announcements Block" has been disabled.\')');
				}
			});
	});

	it('Enable Announcements Block', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.get('nav[class="app__nav"] a:contains("Website")').click();
		cy.get('button[id="plugins-button"]').click();
		// Find and enable the plugin
		cy.get('input[id^="select-cell-announcementsblockplugin-enabled"]').click();
		cy.get('div:contains(\'The plugin "Announcements Block" has been enabled.\')');
		cy.waitJQuery();
		cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-blocks-row-announcementsblockplugin"] a[class="show_extras"]').click();
		cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-blocks-row-announcementsblockplugin-settings-button"]').click();
		// Fill out settings form
		cy.waitJQuery();
		cy.wait(1000);
		cy.get('form[id="announcementsSettings"] input[name="announcementsAmount"]').clear().type('5');
		cy.get('form[id="announcementsSettings"] input[name="truncateNum"]').clear().type('250');
		// submit settings form
		cy.get('form[id="announcementsSettings"] button[id^="submitFormButton"]').click();
		cy.waitJQuery();		// enable block in sidebar if disabled
		cy.get('nav[class="app__nav"] a:contains("Website")').click();
		cy.get('button[id="appearance-button"]').click();
		cy.get('button[id="appearance-setup-button"]').click();
		cy.get('div[id="appearance-setup"] input[value="announcementsblockplugin"]')
			.then($btn => {
				if ($btn.attr('checked') !== 'checked' && $btn.attr('checked') !== true) {
					cy.get('div[id="appearance-setup"] input[value="announcementsblockplugin"]').check();
					cy.get('div[id="appearance-setup"] div[class*="pkpFormPage__footer"] button[class="pkpButton"]').click();
				}
			});
	});

	it('Enable Announcements', function () {
		//cy.login('admin', 'admin', 'publicknowledge');
		cy.login('admin', 'admin', 'publicknowledge');
		cy.get('nav[class="app__nav"] a:contains("Website")').click();
		cy.get('div[class*="pkpTabs__buttons"] button[id="setup-button"]').first().click();
		cy.get('div[class*="pkpTabs--side"] button[id="announcements-button"]').click();
		cy.get('div[id="announcements"] input[name="enableAnnouncements"]').check();
		cy.get('div[id="announcements"] button[class="pkpButton"]').click();
	});


	it('Write Announcement', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.get('nav[class="app__nav"] a:contains("Announcements")').click();
		cy.get('button[class="pkpButton"]:contains("Add Announcement")').click();
		cy.wait(1000);
		cy.get('div[class="modal"] input[id="announcement-title-control-en"]').type('Automatic Test Announcement');
		cy.setTinyMceContent('announcement-descriptionShort-control-en', 'This is an automatically written short description!');
		cy.setTinyMceContent('announcement-description-control-en', 'This is an automatically written long description!');
		cy.wait(1000);
		cy.get('div[class="modal"] button[label="Save"]').click()
	});

	it('Check Announcement Block', function () {
		cy.visit('/');
		cy.get('div[class*="block_announcements"]');
		cy.get('div[class*="block_announcements"] h3:contains("Automatic Test Announcement")');
		cy.get('div[class*="block_announcements"] p:contains("This is an automatically written short description!")');
	});

	function openBlockSettings() {
		cy.visit('/index.php/publicknowledge/management/settings/website');
		cy.get('button[id="plugins-button"]').click();
		cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-blocks-row-announcementsblockplugin"] a[class="show_extras"]').click();
		cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-blocks-row-announcementsblockplugin-settings-button"]').click();
		cy.waitJQuery();
		cy.wait(1000);
	}

	function addAnnouncement(title, description, dateExpire) {
		cy.visit('/index.php/publicknowledge/management/settings/announcements');
		cy.wait(1000);
		cy.contains('button', 'Add Announcement').click();
		cy.wait(1000);
		cy.get('div[class="modal"] input[id="announcement-title-control-en"]').type(title);
		cy.setTinyMceContent('announcement-descriptionShort-control-en', description);
		if (dateExpire) {
			cy.get('div[class="modal"] input[id="announcement-dateExpire-control"]').type(dateExpire);
		}
		cy.wait(1000);
		cy.get('div[class="modal"] button[label="Save"]').click();
		cy.wait(1000);
	}

	it('Expired announcements are excluded and do not consume the display limit', function () {
		// Regression test for the limit()/filterByActive() ordering bug: an
		// expired announcement created *after* an active one used to be
		// picked up by limit() first and only discarded afterwards, so with
		// a limit of 1 the block showed nothing instead of falling back to
		// the older, still-active announcement.
		cy.login('admin', 'admin', 'publicknowledge');
		openBlockSettings();
		cy.get('form[id="announcementsSettings"] input[name="announcementsAmount"]').clear().type('1');
		cy.get('form[id="announcementsSettings"] button[id^="submitFormButton"]').click();
		cy.waitJQuery();

		addAnnouncement('Regression Older Active', 'Still active announcement.');
		addAnnouncement('Regression Recent Expired', 'Expired announcement.', '2020-01-01');

		cy.visit('/');
		cy.get('div[class*="block_announcements"] h3:contains("Regression Older Active")');
		cy.get('div[class*="block_announcements"]').should('not.contain.text', 'Regression Recent Expired');
	});

	it('Rejects an invalid alignment value and falls back to left', function () {
		// Regression test for the announcementsAlign allowlist: the setting
		// is only ever offered as a <select> in the UI, so the malicious
		// value has to be posted directly to the same endpoint the form
		// submits to, bypassing the dropdown entirely.
		cy.login('admin', 'admin', 'publicknowledge');
		openBlockSettings();
		cy.get('form[id="announcementsSettings"]').then($form => {
			const action = $form.attr('action');
			const csrfToken = $form.find('input[name="csrfToken"]').val();
			cy.request({
				method: 'POST',
				url: action,
				form: true,
				body: {
					csrfToken: csrfToken,
					announcementsAmount: '5',
					truncateNum: '250',
					announcementsAlign: 'left; } body { display:none; } .x {',
				},
			}).its('status').should('eq', 200);
		});

		cy.visit('/');
		cy.get('div[class*="block_announcements"]')
			.prev('style')
			.invoke('text')
			.should('include', 'text-align: left')
			.and('not.include', 'display:none');
	});

	it('Applies a valid alignment value to the rendered block', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		openBlockSettings();
		cy.get('form[id="announcementsSettings"] select[name="announcementsAlign"]').select('center');
		cy.get('form[id="announcementsSettings"] button[id^="submitFormButton"]').click();
		cy.waitJQuery();

		cy.visit('/');
		cy.get('div[class*="block_announcements"]')
			.prev('style')
			.invoke('text')
			.should('include', 'text-align: center');

		// leave the setting the way the rest of the suite expects it
		openBlockSettings();
		cy.get('form[id="announcementsSettings"] select[name="announcementsAlign"]').select('left');
		cy.get('form[id="announcementsSettings"] button[id^="submitFormButton"]').click();
		cy.waitJQuery();
	});

	it('Truncates long descriptions to the configured character limit', function () {
		// truncateNum was already set to 250 in "Enable Announcements Block".
		cy.login('admin', 'admin', 'publicknowledge');
		const longDescription = 'Start of a long description. ' + 'Lorem ipsum dolor sit amet. '.repeat(15) + 'END-MARKER-XYZ';
		addAnnouncement('Truncation Test', longDescription);

		cy.visit('/');
		cy.get('div[class*="block_announcements"] h3:contains("Truncation Test")')
			.parents('article')
			.find('div[class*="block_announcements_article_content"]')
			.invoke('text')
			.should('include', 'Start of a long description')
			.and('not.include', 'END-MARKER-XYZ');
	});

	it('Limits the number of announcements shown to the configured amount', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		openBlockSettings();
		cy.get('form[id="announcementsSettings"] input[name="announcementsAmount"]').clear().type('2');
		cy.get('form[id="announcementsSettings"] button[id^="submitFormButton"]').click();
		cy.waitJQuery();

		addAnnouncement('Amount Test 1 (oldest)', 'First of three.');
		addAnnouncement('Amount Test 2', 'Second of three.');
		addAnnouncement('Amount Test 3 (newest)', 'Third of three.');

		cy.visit('/');
		cy.get('div[class*="block_announcements"] article').should('have.length', 2);
		cy.get('div[class*="block_announcements"] h3:contains("Amount Test 3 (newest)")');
		cy.get('div[class*="block_announcements"] h3:contains("Amount Test 2")');
		cy.get('div[class*="block_announcements"]').should('not.contain.text', 'Amount Test 1 (oldest)');
	});
});

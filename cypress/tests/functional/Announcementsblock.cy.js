describe('Announcements Block plugin tests', function () {

	function openWebsiteSettings() {
		cy.visit('/index.php/publicknowledge/management/settings/website');
	}

	function openBlockSettings() {
		openWebsiteSettings();
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
		cy.get('[role="dialog"] input[id="announcement-title-control-en"]').type(title);
		cy.setTinyMceContent('announcement-descriptionShort-control-en', description);
		if (dateExpire) {
			cy.get('[role="dialog"] input[id="announcement-dateExpire-control"]').type(dateExpire);
		}
		cy.wait(1000);
		cy.get('[role="dialog"] button[label="Save"]').click();
		cy.wait(1000);
	}

	it('Disable Announcements Block', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		openWebsiteSettings();
		cy.get('button[id="plugins-button"]').click();
		// disable plugin if enabled
		cy.get('input[id^="select-cell-announcementsblockplugin-enabled"]')
			.then($btn => {
				if ($btn.attr('checked') === 'checked') {
					cy.get('input[id^="select-cell-announcementsblockplugin-enabled"]').click();
					cy.get('[data-cy="dialog"]').contains('button', 'OK').click();
					cy.get('div:contains(\'The plugin "Announcements Block" has been disabled.\')');
				}
			});
	});

	it('Enable Announcements Block', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		openWebsiteSettings();
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
		cy.waitJQuery();
		// enable block in sidebar if disabled
		openWebsiteSettings();
		cy.get('button[id="appearance-button"]').click();
		cy.get('button[id="appearance-setup-button"]').click();
		cy.get('div[id="appearance-setup"] input[value="announcementsblockplugin"]')
			.then($btn => {
				if ($btn.attr('checked') !== 'checked' && $btn.attr('checked') !== true) {
					cy.get('div[id="appearance-setup"] input[value="announcementsblockplugin"]').check();
					cy.get('div[id="appearance-setup"] div[class*="pkpFormPage__footer"] button[label="Save"]').click();
				}
			});
	});

	it('Saving the plugin settings succeeds without a server error', function () {
		// Regression test: the settings form's execute() used the global
		// NOTIFICATION_TYPE_SUCCESS constant, which no longer exists on OJS 3.5.
		// The settings were persisted but the request then died with an
		// "Undefined constant" error, so the modal reported a failed save.
		cy.login('admin', 'admin', 'publicknowledge');
		cy.intercept('POST', '**/settings-plugin-grid/manage*').as('saveSettings');
		openBlockSettings();
		cy.get('form[id="announcementsSettings"] button[id^="submitFormButton"]').click();
		cy.wait('@saveSettings').then(({response}) => {
			expect(response.statusCode).to.eq(200);
			expect(response.body.status).to.eq(true);
		});
	});

	it('Enable Announcements', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		openWebsiteSettings();
		cy.get('button[id="setup-button"]').first().click();
		cy.get('button[id="announcements-button"]').click();
		cy.get('div[id="announcements"] input[name="enableAnnouncements"]').check();
		cy.get('div[id="announcements"] button[label="Save"]').click();
	});

	it('Write Announcement', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.visit('/index.php/publicknowledge/management/settings/announcements');
		cy.contains('button', 'Add Announcement').click();
		cy.wait(1000);
		cy.get('[role="dialog"] input[id="announcement-title-control-en"]').type('Automatic Test Announcement');
		cy.setTinyMceContent('announcement-descriptionShort-control-en', 'This is an automatically written short description!');
		cy.setTinyMceContent('announcement-description-control-en', 'This is an automatically written long description!');
		cy.wait(1000);
		cy.get('[role="dialog"] button[label="Save"]').click();
	});

	it('Check Announcement Block', function () {
		cy.visit('/');
		cy.get('div[class*="block_announcements"]');
		cy.get('div[class*="block_announcements"] h3:contains("Automatic Test Announcement")');
		cy.get('div[class*="block_announcements"] p:contains("This is an automatically written short description!")');
	});

	it('Links to the full announcements page', function () {
		// Regression test: the 3.5 port dropped this link (issue #11).
		cy.visit('/');
		cy.get('div[class*="block_announcements"] a#show-all')
			.should('contain.text', 'Show all announcements')
			.and('have.attr', 'href')
			.and('match', /\/announcement$/);
		cy.get('div[class*="block_announcements"] a#show-all').click();
		cy.location('pathname').should('match', /\/announcement$/);
	});

	it('Expired announcements are excluded and do not consume the display limit', function () {
		// The 3.4 line had a limit()/filterByActive() ordering bug where an
		// expired announcement created *after* an active one crowded it out
		// under a small limit. 3.5's withActiveByDate() scope is applied in
		// the query before the limit, so this guards against that ever being
		// reintroduced when the query is touched.
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
		// The setting is only ever offered as a <select> in the UI, so the
		// malicious value has to be posted directly to the same endpoint the
		// form submits to, bypassing the dropdown entirely.
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

	it('Falls back to the default announcement count when the field is cleared', function () {
		// A cleared amount used to prefill as an empty field while the block
		// silently rendered the default of 2. The form now shows the number
		// that is actually in effect. The two prior tests left more than two
		// active announcements behind, so the default is observable.
		cy.login('admin', 'admin', 'publicknowledge');
		openBlockSettings();
		cy.get('form[id="announcementsSettings"] input[name="announcementsAmount"]').clear();
		cy.get('form[id="announcementsSettings"] button[id^="submitFormButton"]').click();
		cy.waitJQuery();

		openBlockSettings();
		cy.get('form[id="announcementsSettings"] input[name="announcementsAmount"]').should('have.value', '2');

		cy.visit('/');
		cy.get('div[class*="block_announcements"] article').should('have.length', 2);
	});
});

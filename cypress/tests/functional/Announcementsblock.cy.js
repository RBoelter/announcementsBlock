describe('Announcements Block plugin tests', function () {

	it('Disable Announcements Block', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.get('ul[id="navigationPrimary"] a:contains("Settings")').click();
		cy.get('ul[id="navigationPrimary"] a:contains("Website")').click();
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
		cy.get('ul[id="navigationPrimary"] a:contains("Settings")').click();
		cy.get('ul[id="navigationPrimary"] a:contains("Website")').click();
		cy.get('button[id="plugins-button"]').click();
		// Find and enable the plugin
		cy.get('input[id^="select-cell-announcementsblockplugin-enabled"]').click();
		cy.get('div:contains(\'The plugin "Announcements Block" has been enabled.\')');
		cy.waitJQuery();
		cy.get('tr[id="component-grid-settings-plugins-settingsplugingrid-category-blocks-row-announcementsblockplugin"] a[class="show_extras"]').click();
		cy.get('a[id^="component-grid-settings-plugins-settingsplugingrid-category-blocks-row-announcementsblockplugin-settings-button"]').click();
		// Fill out settings form
		cy.waitJQuery();
		cy.wait(500);
		cy.get('form[id="announcementsSettings"] input[name="announcementsAmount"]').clear().type('5');
		cy.get('form[id="announcementsSettings"] input[name="truncateNum"]').clear().type('250');
		// submit settings form
		cy.get('form[id="announcementsSettings"] button[id^="submitFormButton"]').click();
		cy.waitJQuery();		// enable block in sidebar if disabled
		cy.get('ul[id="navigationPrimary"] a:contains("Settings")').click();
		cy.get('ul[id="navigationPrimary"] a:contains("Website")').click();
		cy.get('div[class*="pkpTabs--side"] button[id="setup-button"]').click();
		cy.get('div[class*="pkpTabs--side"] #setup input[value="announcementsblockplugin"]')
			.then($btn => {
				if ($btn.attr('checked') !== 'checked' && $btn.attr('checked') !== true) {
					cy.get('div[class*="pkpTabs--side"] #setup input[value="announcementsblockplugin"]').check();
					cy.get('div[class*="pkpTabs--side"] #setup div[class="pkpFormPage__buttons"] button[class="pkpButton"]').click();
				}
			});
	});

	it('Enable Announcements', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.get('ul[id="navigationPrimary"] a:contains("Settings")').click();
		cy.get('ul[id="navigationPrimary"] a:contains("Website")').click();
		cy.get('div[class*="pkpTabs__buttons"] button[id="setup-button"]').first().click();
		cy.get('div[class*="pkpTabs--side"] button[id="announcements-button"]').click();
		cy.get('div[id="announcements"] input[name="enableAnnouncements"]').check();
		cy.waitJQuery();
		cy.get('div[id="announcements"] input[name="numAnnouncementsHomepage"]').clear().type('5');
		cy.get('div[id="announcements"] button[class="pkpButton"]').click();
	});


	it('Write Announcement', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.get('ul[id="navigationPrimary"] a:contains("Announcements")').click();
		cy.get('div[id="announcements"] a:contains("Add Announcement")').click();
		cy.waitJQuery();
		cy.wait(1500);
		cy.get('form[id="announcementForm"] input[name="title[en_US]"]').type('Automatic Test Announcement');
		cy.wait(1500);
		cy.get('form[id="announcementForm"] textarea[name="descriptionShort[en_US]"]').then(node => {
			cy.setTinyMceContent(node.attr('id'), 'This is an automatically written short description!');
		});
		cy.wait(1500);
		cy.get('form[id="announcementForm"] textarea[name="description[en_US]"]').then(node => {
			cy.setTinyMceContent(node.attr('id'), 'This is an automatically written long description!');
		});
		cy.wait(1000);
		cy.get('form[id="announcementForm"] input[name="sendAnnouncementNotification"]').uncheck();
		cy.get('form[id="announcementForm"] button[id^="submitFormButton"]').click()

	});

	it('Check Announcement Block', function () {
		cy.login('admin', 'admin', 'publicknowledge');
		cy.get('ul[id="navigationUser"] li[class="view_frontend"] a').click();
		cy.get('div[class*="block_announcements"]');
		cy.get('div[class*="block_announcements"] h3:contains("Automatic Test Announcement")');
		cy.get('div[class*="block_announcements"] p:contains("This is an automatically written short description!")');
	});
});

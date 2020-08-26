<?php

import('lib.pkp.classes.form.Form');

class AnnouncementsBlockPluginSettingsForm extends Form
{


	public $plugin;

	public function __construct($plugin)
	{
		parent::__construct($plugin->getTemplateResource('settings.tpl'));
		$this->plugin = $plugin;
		$this->addCheck(new FormValidatorPost($this));
		$this->addCheck(new FormValidatorCSRF($this));
	}

	/**
	 * Load settings already saved in the database
	 *
	 * Settings are stored by context, so that each journal or press
	 * can have different settings.
	 */
	public function initData()
	{
		$contextId = Application::get()->getRequest()->getContext()->getId();
		$this->setData('announcementsAmount', $this->plugin->getSetting($contextId, 'announcementsAmount') == null ? 2 : $this->plugin->getSetting($contextId, 'announcementsAmount'));
		$this->setData('truncateNum', $this->plugin->getSetting($contextId, 'truncateNum'));
		parent::initData();
	}

	/**
	 * Load data that was submitted with the form
	 */
	public function readInputData()
	{
		$this->readUserVars(['announcementsAmount', 'truncateNum']);
		parent::readInputData();
	}

	/**
	 * Fetch any additional data needed for your form.
	 *
	 * Data assigned to the form using $this->setData() during the
	 * initData() or readInputData() methods will be passed to the
	 * template.
	 */
	public function fetch($request, $template = null, $display = false)
	{
		$templateMgr = TemplateManager::getManager($request);
		$templateMgr->assign('pluginName', $this->plugin->getName());
		return parent::fetch($request, $template, $display);
	}

	/**
	 * Save the settings
	 * @param mixed ...$functionArgs
	 * @return mixed|null
	 */
	public function execute(...$functionArgs)
	{
		$request = Application::get()->getRequest();
		$contextId = $request->getContext()->getId();
		$this->plugin->updateSetting($contextId, 'announcementsAmount', $this->getData('announcementsAmount'));
		$this->plugin->updateSetting($contextId, 'truncateNum', $this->getData('truncateNum'));
		import('classes.notification.NotificationManager');
		$notificationMgr = new NotificationManager();
		$notificationMgr->createTrivialNotification(
			$request->getUser()->getId(),
			NOTIFICATION_TYPE_SUCCESS,
			['contents' => __('common.changesSaved')]
		);
		return parent::execute();
	}
}

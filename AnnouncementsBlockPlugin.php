<?php

namespace APP\plugins\blocks\announcementsBlock;

use PKP\plugins\BlockPlugin;
use PKP\linkAction\request\AjaxModal;
use APP\core\Application;
use PKP\announcement\Announcement;
use PKP\linkAction\LinkAction;
use PKP\core\JSONMessage;

class AnnouncementsBlockPlugin extends BlockPlugin
{
	public function getDisplayName()
	{
		return __('plugins.blocks.announcements.title');
	}
	
	public function getDescription()
	{
		return __('plugins.blocks.announcements.desc');
	}
	
	public function getContents($templateMgr, $request = null)
	{
		$request = Application::get()->getRequest();
		$context = $request->getContext();
		$contextId = ($context && $context->getId()) ? $context->getId() : 0;
		
		$amount = ctype_digit((string)$this->getSetting($contextId, 'announcementsAmount')) ? intval($this->getSetting($contextId, 'announcementsAmount')) : 2;
		
		// Use Eloquent model for OJS 3.5
		$announcements = Announcement::withContextIds([$contextId])
			->withActiveByDate()
			->limit($amount)
			->orderBy(Announcement::CREATED_AT, 'desc')
			->get();
		
		$templateMgr->assign('announcementsSidebar', $announcements);
		$templateMgr->assign('truncateNum', ctype_digit((string)$this->getSetting($contextId, 'truncateNum')) ? intval($this->getSetting($contextId, 'truncateNum')) : null);
		$templateMgr->assign('textAlign', $this->getSetting($contextId, 'announcementsAlign') ? $this->getSetting($contextId, 'announcementsAlign') : 'left');
		
		return parent::getContents($templateMgr, $request);
	}
	
	public function getActions($request, $actionArgs)
	{
		$actions = parent::getActions($request, $actionArgs);
		if (!$this->getEnabled()) {
			return $actions;
		}
		$router = $request->getRouter();
		$linkAction = new LinkAction(
			'settings',
			new AjaxModal(
				$router->url($request, null, null, 'manage', null, array('verb' => 'settings', 'plugin' => $this->getName(), 'category' => 'blocks')),
				$this->getDisplayName()
			),
			__('manager.plugins.settings'),
			null
		);
		array_unshift($actions, $linkAction);
		return $actions;
	}
	
	public function manage($args, $request)
	{
		switch ($request->getUserVar('verb')) {
			case 'settings':
				require_once(__DIR__ . '/AnnouncementsBlockPluginSettingsForm.php');
				$form = new AnnouncementsBlockPluginSettingsForm($this);
				if (!$request->getUserVar('save')) {
					$form->initData();
					return new JSONMessage(true, $form->fetch($request));
				}
				$form->readInputData();
				if ($form->validate()) {
					$form->execute();
					return new JSONMessage(true);
				}
		}
		return parent::manage($args, $request);
	}
}

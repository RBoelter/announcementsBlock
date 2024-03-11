<?php

namespace APP\plugins\blocks\announcementsBlock;

use APP\facades\Repo;
use PKP\db\DAORegistry;
use APP\core\Application;
use PKP\core\JSONMessage;
use PKP\plugins\BlockPlugin;
use PKP\linkAction\LinkAction;
use PKP\linkAction\request\AjaxModal;
use APP\plugins\blocks\announcementsBlock\AnnouncementsBlockPluginSettingsForm;

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
		$contextId = ($context && $context->getId()) ? $context->getId() : CONTEXT_SITE;
		
		$amount = ctype_digit($this->getSetting($contextId, 'announcementsAmount')) ? intval($this->getSetting($contextId, 'announcementsAmount')) : 2;
		
		$announcements = Repo::announcement()->getCollector()
			->filterByContextIds([$contextId])
			->limit($amount)
            ->offset(0)
			->getMany();
		$announcements = array_filter(
			$announcements->toArray(),
			function($a) {
				return ($a->getDateExpire() == null || strtotime($a->getDateExpire()) > time());
			}
		);

		$templateMgr->assign('announcementsSidebar', $announcements);
		$templateMgr->assign(
			'truncateNum',
			ctype_digit($this->getSetting($contextId, 'truncateNum')) ? intval($this->getSetting($contextId, 'truncateNum')) : null
		);
		$templateMgr->assign(
			'textAlign',
			$this->getSetting($contextId, 'announcementsAlign') ? $this->getSetting($contextId, 'announcementsAlign') : 'left'
		);

		return parent::getContents($templateMgr, $request);
	}

	public function getActions($request, $actionArgs)
	{
		$actions = parent::getActions($request, $actionArgs);
		if (!$this->getEnabled()) {
			return $actions;
		}
		$router = $request->getRouter();
		
		$linkAction = new \PKP\linkAction\LinkAction(
			'settings',
			new \PKP\linkAction\request\AjaxModal(
				$router->url(
					$request,
					null,
					null,
					'manage',
					null,
					array(
						'verb' => 'settings',
						'plugin' => $this->getName(),
						'category' => 'blocks',
					)
				),
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
				$form = new \APP\plugins\blocks\announcementsBlock\AnnouncementsBlockPluginSettingsForm($this);
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

if (!PKP_STRICT_MODE) {
    class_alias('\APP\plugins\blocks\announcementsBlock\AnnouncementsBlockPlugin', '\AnnouncementsBlockPlugin');
}

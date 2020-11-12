<?php

import('lib.pkp.classes.plugins.BlockPlugin');

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
		$announcementDao = DAORegistry::getDAO('AnnouncementDAO');
		$amount = ctype_digit($this->getSetting($contextId, 'announcementsAmount')) ? intval($this->getSetting($contextId, 'announcementsAmount')) : 2;
		$announcements = $announcementDao->getNumAnnouncementsNotExpiredByAssocId($context->getAssocType(), $contextId, $amount);
		$templateMgr->assign('announcementsSidebar', $announcements->toArray());
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
		import('lib.pkp.classes.linkAction.request.AjaxModal');
		$linkAction = new LinkAction(
			'settings',
			new AjaxModal(
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
				$this->import('AnnouncementsBlockPluginSettingsForm');
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

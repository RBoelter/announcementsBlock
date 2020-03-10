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
		$request = Application::getRequest();
		$context = $request->getContext();
		$announcementDao = DAORegistry::getDAO('AnnouncementDAO');
		$amount = ctype_digit($this->getSetting($context->getId(), 'announcementsAmount')) ? intval($this->getSetting($context->getId(), 'announcementsAmount')) : 2;
		$announcements =& $announcementDao->getNumAnnouncementsNotExpiredByAssocId($context->getAssocType(), $context->getId(), $amount);
		$templateMgr->assign('announcementsSidebar', $announcements->toArray());
		$templateMgr->assign('truncateNum', ctype_digit($this->getSetting($context->getId(), 'truncateNum')) ? intval($this->getSetting($context->getId(), 'truncateNum')) : null);
		$templateMgr->assign('textAlign', $this->getSetting($context->getId(), 'textAlign') ? $this->getSetting($context->getId(), 'textAlign') : 'justify');
		$templateMgr->assign('headlineSize', $this->getSetting($context->getId(), 'headlineSize') ? $this->getSetting($context->getId(), 'headlineSize') : 'h2');
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
						'category' => 'blocks'
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
				$templateMgr = TemplateManager::getManager($request);
				$templateMgr->assign('headlineSizeOptions', [
					'h2' => 'plugins.blocks.announcements.settings.h2',
					'h3' => 'plugins.blocks.announcements.settings.h3',
					'h4' => 'plugins.blocks.announcements.settings.h4',
					'h5' => 'plugins.blocks.announcements.settings.h5'
				]);
				$templateMgr->assign('textAlignOptions', [
					'left' => 'plugins.blocks.announcements.settings.left',
					'right' => 'plugins.blocks.announcements.settings.right',
					'center' => 'plugins.blocks.announcements.settings.center',
					'justify' => 'plugins.blocks.announcements.settings.justify'
				]);
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

<?php

namespace APP\plugins\blocks\announcementsBlock;

use APP\facades\Repo;
use APP\core\Application;
use PKP\core\JSONMessage;
use PKP\plugins\BlockPlugin;
use PKP\linkAction\LinkAction;
use PKP\linkAction\request\AjaxModal;

class AnnouncementsBlockPlugin extends BlockPlugin
{
	public const DEFAULT_ANNOUNCEMENTS_AMOUNT = 2;

	public function getDisplayName()
	{
		return __('plugins.blocks.announcements.title');
	}


	public function getDescription()
	{
		return __('plugins.blocks.announcements.desc');
	}

	/**
	 * The number of announcements to show, falling back to the default when
	 * the setting is unset or not a plain number.
	 */
	public function getAnnouncementsAmount($contextId): int
	{
		$amount = (string) $this->getSetting($contextId, 'announcementsAmount');
		return ctype_digit($amount) ? intval($amount) : self::DEFAULT_ANNOUNCEMENTS_AMOUNT;
	}

	public function getContents($templateMgr, $request = null)
	{
		$request ??= Application::get()->getRequest();
		$contextId = $this->getCurrentContextId();

		$announcements = Repo::announcement()->getCollector()
			->filterByContextIds([$contextId])
			->filterByActive()
			->limit($this->getAnnouncementsAmount($contextId))
			->getMany();

		$templateMgr->assign('announcementsSidebar', $announcements->toArray());

		$rawTruncateNum = $this->getSetting($contextId, 'truncateNum');
		$templateMgr->assign(
			'truncateNum',
			ctype_digit((string) $rawTruncateNum) ? intval($rawTruncateNum) : null
		);

		$align = $this->getSetting($contextId, 'announcementsAlign');
		$templateMgr->assign(
			'textAlign',
			in_array($align, ['left', 'right', 'center', 'justify'], true) ? $align : 'left'
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

if (!PKP_STRICT_MODE) {
    class_alias('\APP\plugins\blocks\announcementsBlock\AnnouncementsBlockPlugin', '\AnnouncementsBlockPlugin');
}

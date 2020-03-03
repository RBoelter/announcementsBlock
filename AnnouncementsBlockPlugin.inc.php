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
	    $amount = $this->getSetting($context->getId(), 'announcementsAmount');
	    $amount = ctype_digit($amount) ? intval($amount) : 2;
	    $announcements =& $announcementDao->getNumAnnouncementsNotExpiredByAssocId($context->getAssocType(), $context->getId(), $amount);
        $templateMgr->assign('announcementsSidebar', $announcements->toArray());
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

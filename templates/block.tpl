{if $announcementsSidebar && sizeof($announcementsSidebar)>0}
	<div class="pkp_block block_announcements">
		<span class="title">{translate key="announcement.announcements"}</span>
		<div class="content">
            {foreach name=announcements from=$announcementsSidebar item=announcement}
				<article class="block_announcements_article" {if !$smarty.foreach.announcements.last}style="padding-bottom: 15px; border-bottom: 1px solid gray;" {/if}>
					<a class="block_announcements_article_headline"
					   href="{url router=$smarty.const.ROUTE_PAGE page="announcement" op="view" path=$announcement->getId()}">
						<{$headlineSize}>{$announcement->getLocalizedTitle()|escape}</{$headlineSize}>
					</a>
					<time class="block_announcements_article_date" style="font-weight: bold;" datetime="{$announcement->getDatePosted()}">
                        {$announcement->getDatePosted()|date_format:"%e. %B %Y"}
					</time>
					<p class="block_announcements_article_content" style="text-align: {$textAlign};">
                        {assign var="ann_desc" value=$announcement->getLocalizedDescriptionShort()|strip_unsafe_html|regex_replace:"/(<p>|<p [^>]*>)/":""|regex_replace:"/(<\\/p>)/":"<br />"}
                        {if $truncateNum}
                            {assign var="truncateNum" value=$truncateNum|intval}
                            {$ann_desc|truncate:$truncateNum}
                        {else}
                            {$ann_desc}
                        {/if}
					</p>
				</article>
            {/foreach}
		</div>
	</div>
{/if}
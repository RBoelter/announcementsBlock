{if !empty($announcementsSidebar)}
	<style type="text/css">
		.block_announcements_article:not(:last-child) {
			padding-bottom: 1.5em;
			border-bottom: 1px solid;

		}

		.block_announcements_article {
			text-align: {$textAlign};
		}
	</style>
	<div class="pkp_block block_announcements">
		<h2 class="title">{translate key="announcement.announcements"}</h2>
		<div class="content">
			{foreach name=announcements from=$announcementsSidebar item=announcement}
				<article class="block_announcements_article">
					<h3 class="block_announcements_article_headline">
						<a href="{url router=$smarty.const.ROUTE_PAGE page="announcement" op="view" path=$announcement->getId()}">
							{$announcement->getLocalizedTitle()|escape}
						</a>
					</h3>
					<time class="block_announcements_article_date" datetime="{$announcement->getDatePosted()}">
						<strong>{$announcement->getDatePosted()|date_format:$dateFormatLong}</strong>
					</time>
					<div class="block_announcements_article_content">
						{assign var="ann_desc" value=$announcement->getLocalizedDescriptionShort()|strip_unsafe_html}
						{if $truncateNum}
							{assign var="truncateNum" value=$truncateNum|intval}
							{$ann_desc|truncate:$truncateNum}
						{else}
							{$ann_desc}
						{/if}
					</div>
				</article>
			{/foreach}
		</div>
	</div>
{/if}

<?php

declare(strict_types=1);

/*
 * This file is part of «Epigraphy of Medieval Rus» database.
 *
 * Copyright (c) National Research University Higher School of Economics
 *
 * «Epigraphy of Medieval Rus» database is free software:
 * you can redistribute it and/or modify it under the terms of the
 * GNU General Public License as published by the Free Software Foundation, version 3.
 *
 * «Epigraphy of Medieval Rus» database is distributed
 * in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even
 * the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU General Public License for more details.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code. If you have not received
 * a copy of the GNU General Public License along with
 * «Epigraphy of Medieval Rus» database,
 * see <http://www.gnu.org/licenses/>.
 */

namespace App\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use TeamTNT\TNTSearch\TNTSearch;

final class BuildFulltextIndexCommand extends Command
{
    protected static $defaultName = 'app:build-fulltext-index';

    protected function configure(): void
    {
        $this->setDescription('Build fulltext search index for inscriptions');
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $projectDir = $this->getApplication()->getKernel()->getProjectDir();
        $storage = $projectDir . '/var/tnt';
        
        if (!is_dir($storage)) {
            mkdir($storage, 0775, true);
        }

        // Parse DATABASE_URL like in the main application
        $db_url = $_ENV['DATABASE_URL'];
        $db_parameters = parse_url($db_url);

        $tnt = new TNTSearch();
        $tnt->loadConfig([
            'driver'   => $db_parameters["scheme"],
            'host'     => $db_parameters["host"],
            'database' => str_replace('/', '', $db_parameters["path"]),
            'username' => $db_parameters["user"],
            'password' => $db_parameters["pass"],
            'storage'  => $storage,
            'stemmer'  => \TeamTNT\TNTSearch\Stemmer\RussianStemmer::class,
            'charset'  => 'utf8',
        ]);

        $output->writeln('Building fulltext index...');

        // Create index file under var/tnt/
        $indexer = $tnt->createIndex('fulltext.index');
        $indexer->setPrimaryKey('id');

        // Build comprehensive searchable content from all inscription-related tables
        $indexer->query(<<<SQL
SELECT
  inscription.id,
  CONCAT_WS(' ',
    inscription.comment,
    inscription.date_explanation,
    zero_row.place_on_carrier,
    zero_row.text,
    zero_row.translation,
    zero_row.transliteration,
    zero_row.description,
    zero_row.date_in_text,
    zero_row.non_stratigraphical_date,
    zero_row.reconstruction,
    zero_row.normalization,
    zero_row.interpretation_comment,
    zero_row.origin,
    interpretation.comment,
    interpretation.place_on_carrier,
    interpretation.text,
    interpretation.translation,
    interpretation.transliteration,
    interpretation.description,
    interpretation.date_in_text,
    interpretation.non_stratigraphical_date,
    interpretation.reconstruction,
    interpretation.normalization,
    interpretation.interpretation_comment,
    interpretation.origin,
    carrier.find_circumstances,
    carrier.characteristics,
    carrier.individual_name,
    carrier.stratigraphical_date,
    carrier.material_description,
    carrier.carrier_history,
    carrier.storage_localization
  ) AS content
FROM inscription 
INNER JOIN carrier ON inscription.carrier_id = carrier.id 
INNER JOIN zero_row ON inscription.zero_row_id = zero_row.id 
INNER JOIN interpretation ON inscription.id = interpretation.inscription_id
SQL);

        $indexer->run();

        $output->writeln("Index built successfully at: {$storage}/fulltext.index");

        return Command::SUCCESS;
    }
}



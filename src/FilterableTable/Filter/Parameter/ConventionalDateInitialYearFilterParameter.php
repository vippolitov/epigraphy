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

namespace App\FilterableTable\Filter\Parameter;

use App\Persistence\Repository\Epigraphy\InscriptionRepository;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\QueryBuilder;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Vyfony\Bundle\FilterableTableBundle\Filter\Configurator\Parameter\ExpressionBuilderInterface;
use Vyfony\Bundle\FilterableTableBundle\Filter\Configurator\Parameter\FilterParameterInterface;
use Vyfony\Bundle\FilterableTableBundle\Persistence\QueryBuilder\Alias\AliasFactoryInterface;

final class ConventionalDateInitialYearFilterParameter implements FilterParameterInterface, ExpressionBuilderInterface
{
    private AliasFactoryInterface $aliasFactory;
    private InscriptionRepository $inscriptionRepository;

    public function __construct(
        AliasFactoryInterface $aliasFactory,
        InscriptionRepository $inscriptionRepository
    ) {
        $this->aliasFactory = $aliasFactory;
        $this->inscriptionRepository = $inscriptionRepository;
    }

    public function getQueryParameterName(): string
    {
        return 'conventionalDateInitialYear';
    }

    public function getType(): string
    {
        return HiddenType::class;
    }

    public function getOptions(EntityManager $entityManager): array
    {
        return [
            'data' => $this->inscriptionRepository->getMinimalConventionalDate(),
        ];
    }

    /**
     * @param mixed $formData
     */
    public function buildWhereExpression(QueryBuilder $queryBuilder, $formData, string $entityAlias): ?string
    {
        if (null === $formData) {
            return null;
        }

        $conventionalDateInitialYear = (string) $formData;

        // Use DQL functions SUBSTRING/LOCATE and compare numerically via DB implicit casting
        // Left part (initial year) is first 4 characters
        $paramName = $entityAlias.'_conventional_date_min';
        $queryBuilder->setParameter($paramName, $conventionalDateInitialYear);

        return sprintf(
            'SUBSTRING(%s.conventionalDate, 1, 4) >= :%s',
            $entityAlias,
            $paramName
        );
    }
}


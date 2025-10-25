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

namespace App\Persistence\Repository\Epigraphy;

use App\Persistence\Entity\Epigraphy\Inscription;
use App\Services\Epigraphy\Sorting\InscriptionComparerInterface;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

final class InscriptionRepository extends ServiceEntityRepository
{
    private InscriptionComparerInterface $inscriptionComparer;

    public function __construct(ManagerRegistry $registry, InscriptionComparerInterface $inscriptionComparer)
    {
        parent::__construct($registry, Inscription::class);

        $this->inscriptionComparer = $inscriptionComparer;
    }

    /**
     * @return Inscription[]
     */
    public function findAllInConventionalOrder(bool $onlyShownOnSite = false, bool $onlyPartOfCorpus = false): array
    {
        $criteria = [];

        if ($onlyShownOnSite) {
            $criteria['isShownOnSite'] = true;
        }

        if ($onlyPartOfCorpus) {
            $criteria['isPartOfCorpus'] = true;
        }

        $inscriptions = $this->findBy($criteria);

        usort($inscriptions, fn (Inscription $a, Inscription $b): int => $this->inscriptionComparer->compare($a, $b));

        return $inscriptions;
    }

    public function getMinimalConventionalDate(): int
    {
        $result = $this->createQueryBuilder('i')
            ->select('i.conventionalDate')
            ->where('i.isShownOnSite = :shown')
            ->setParameter('shown', true)
            ->andWhere('i.conventionalDate IS NOT NULL')
            ->getQuery()
            ->getResult();

        $minYear = PHP_INT_MAX;

        foreach ($result as $row) {
            $date = $row['conventionalDate'];
            if ($date) {
                // Extract first year from date string (format: "YYYY" or "YYYY-YYYY")
                $parts = explode('-', $date);
                if (isset($parts[0]) && is_numeric($parts[0])) {
                    $year = (int) $parts[0];
                    if ($year < $minYear) {
                        $minYear = $year;
                    }
                }
            }
        }

        return $minYear === PHP_INT_MAX ? 862 : $minYear;
    }

    public function getMaximalConventionalDate(): int
    {
        $result = $this->createQueryBuilder('i')
            ->select('i.conventionalDate')
            ->where('i.isShownOnSite = :shown')
            ->setParameter('shown', true)
            ->andWhere('i.conventionalDate IS NOT NULL')
            ->getQuery()
            ->getResult();

        $maxYear = 0;

        foreach ($result as $row) {
            $date = $row['conventionalDate'];
            if ($date) {
                // Extract last year from date string (format: "YYYY" or "YYYY-YYYY")
                $parts = explode('-', $date);
                $lastPart = end($parts);
                if (is_numeric($lastPart)) {
                    $year = (int) $lastPart;
                    if ($year > $maxYear) {
                        $maxYear = $year;
                    }
                }
            }
        }

        return $maxYear === 0 ? 1700 : $maxYear;
    }
}
